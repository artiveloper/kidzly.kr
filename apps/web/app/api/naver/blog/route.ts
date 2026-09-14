import { NextRequest, NextResponse } from 'next/server';
import type { NaverBlogRawItem, NaverBlogRawResponse } from '@/domain/naver-blog';
import { countDaycaresByName } from '@/domain/daycare/server';

/**
 * 연관순(sort=sim)은 "창신어린이집"을 토막 내 매칭해 1만 건을 쏟아내고 상위 100건에 쓸 만한
 * 글이 0건인 반면, 최신순(sort=date)은 이름을 거의 구문으로 취급해 110건만 내놓는다.
 * 지역 검색(연관순)이 못 찾던 글을 이쪽이 메운다.
 */
const UPSTREAM_SORT = 'date';

/** 네이버 검색 API의 페이지당 상한. */
const UPSTREAM_DISPLAY = 100;

/**
 * 블로그 섹션은 상세 페이지의 부가 정보다. 네이버가 늦어질 때 페이지를 붙잡아 두느니
 * 이 섹션만 포기한다. 상한이 없으면 undici 기본값(헤더·바디 각 300초)까지 매달린다.
 */
const NAVER_TIMEOUT_MS = 5000;

/**
 * 상위 요청 URL을 start·display와 무관하게 고정한다. 무한 스크롤 다음 페이지가 같은
 * 캐시 항목을 재사용해, 어린이집 한 곳당 네이버 호출은 검색어별로 1시간에 한 번으로 유지된다.
 */
async function fetchNaverBlogItems(query: string, sort: string): Promise<NaverBlogRawItem[]> {
    const url = `https://naverapihub.apigw.ntruss.com/search/v1/blog?query=${encodeURIComponent(query)}&start=1&display=${UPSTREAM_DISPLAY}&sort=${sort}`;

    const response = await fetch(url, {
        headers: {
            'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_API_HUB_CLIENT_ID ?? '',
            'X-NCP-APIGW-API-KEY': process.env.NAVER_API_HUB_CLIENT_SECRET ?? '',
        },
        next: { revalidate: 3600 },
        // Next는 백그라운드 재검증에서만 signal을 떼고 일반 요청엔 그대로 넘긴다 —
        // revalidate 캐시와 함께 써도 된다(next/dist/server/lib/patch-fetch.js).
        signal: AbortSignal.timeout(NAVER_TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`naver blog search failed: ${response.status} (${sort})`);

    const data: NaverBlogRawResponse = await response.json();
    return data.items ?? [];
}

function normalize(text: string): string {
    return text.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
}

function mentions(text: string, keyword: string): boolean {
    return normalize(text).includes(normalize(keyword));
}

/** "만리동2가"처럼 숫자+가로 끝나는 법정동까지 받되, "3509동" 같은 아파트 동 번호는 거른다. */
function isDong(token: string): boolean {
    return /([동읍면]|\d가)$/.test(token) && !/^\d+동$/.test(token);
}

/**
 * 도로명주소는 법정동을 괄호 안에 둔다 — "창신5길 22 (창신동)".
 * 괄호 밖 토큰만 훑으면 동을 통째로 놓치거나(표본 1,000건 중 28.6%)
 * "3509동 102호"의 아파트 동 번호를 동 이름으로 잘못 집어(23.3%) 판정을 망친다.
 */
function extractDong(address: string): string | null {
    // 괄호는 "(3층 건물전체) (산곡동)"처럼 여러 번 나오므로 전부 훑는다.
    const legalDong = [...address.matchAll(/\(([^),]+)/g)].map((match) => (match[1] ?? '').trim()).find(isDong);
    return legalDong ?? address.split(' ').find(isDong) ?? null;
}

/**
 * 글이 이 지역을 가리키는지 볼 때 쓰는 지역어 목록.
 * 시군구는 "수원시영통구"처럼 붙어 오기도 해 "수원시"·"영통구"로도 쪼갠다.
 * 시도는 넣지 않는다 — "서울"만 걸린 글 10건이 전부 송파구 지점 글이었던 것처럼
 * 같은 시도 안의 다른 동명 원을 통째로 통과시킨다.
 */
function buildRegionKeywords(sigungu: string | null, address: string): string[] {
    const keywords = new Set<string>();

    if (sigungu) {
        const joined = sigungu.replace(/\s+/g, '');
        keywords.add(joined);
        for (const token of joined.match(/[가-힣]+?[시군구]/g) ?? []) keywords.add(token);
    }

    const dong = extractDong(address);
    if (dong) keywords.add(dong);

    return [...keywords].filter((keyword) => keyword.length >= 2);
}

export async function GET(request: NextRequest) {
    const name = request.nextUrl.searchParams.get('name');
    const address = request.nextUrl.searchParams.get('address');
    if (!name || !address) {
        return NextResponse.json({ error: 'name and address are required' }, { status: 400 });
    }

    const sigungu = request.nextUrl.searchParams.get('sigungu');
    const start = Number(request.nextUrl.searchParams.get('start') ?? '1');
    const display = Number(request.nextUrl.searchParams.get('display') ?? '5');

    // 이름이 전국에서 유일하면 최신순 한 번으로 끝난다 — 지역 검색을 더해봐야 표본 46곳에서
    // 1곳·2건 늘 뿐이다. 동명 원이 있을 때만 지역 검색을 함께 던져 호출을 1.54회로 누른다.
    const hasSameName = (await countDaycaresByName(name)) > 1;
    const regionQuery = [sigungu, extractDong(address), name].filter(Boolean).join(' ');

    const [recentResult, regionResult] = await Promise.allSettled([
        // 최신순은 검색어에 지역이 붙으면 0건이 되므로(표본 100곳 중 76곳) 이름만 넣는다.
        fetchNaverBlogItems(name, UPSTREAM_SORT),
        // 지역을 검색어에 넣으면 연관순이 그 지역 글을 위로 올려준다. 동명 원 107건 중
        // 지역어가 확인 안 되는 글이 10건뿐이라, 이 결과는 관문 없이 그대로 쓴다.
        hasSameName ? fetchNaverBlogItems(regionQuery, 'sim') : null,
    ]);

    for (const result of [recentResult, regionResult]) {
        if (result.status === 'rejected') console.error('[naver-blog]', result.reason);
    }

    // 한쪽이 끊겨도 남은 검색 결과로 응답한다. 둘 다 실패했을 때만 에러로 올려
    // NaverBlogSectionError 바운더리에 맡긴다.
    if (recentResult.status === 'rejected' && (!hasSameName || regionResult.status === 'rejected')) {
        return NextResponse.json({ error: 'Failed to fetch naver blog' }, { status: 502 });
    }

    const recentItems = recentResult.status === 'fulfilled' ? (recentResult.value ?? []) : [];
    const regionItems = regionResult.status === 'fulfilled' ? (regionResult.value ?? []) : [];

    // 제목에 이름이 박힌 글만 그 어린이집을 다룬 글이다. 본문이나 해시태그에 이름만 스친
    // 동네 목록·분양 홍보 글은 후기가 아니라 언급이라 거른다.
    const titled = (items: NaverBlogRawItem[]) => items.filter((item) => mentions(item.title, name));

    // 최신순 쪽은 검색어에 지역이 없어 어느 지점 글인지 모른 채 딸려온다. 이름이 전국에서
    // 유일하면 제목 일치만으로 확정되지만, 동명 원이 있으면 지역어까지 확인한다. 이 관문이
    // 없으면 "해맑은어린이집"(전국 130곳) 상세에 다른 지역 글 65건이 그대로 올라온다.
    const regionKeywords = buildRegionKeywords(sigungu, address);
    const recent = titled(recentItems).filter(
        (item) =>
            !hasSameName ||
            regionKeywords.some((keyword) => mentions(item.title + item.description, keyword)),
    );

    // 두 검색을 합친다. 지역 검색만 쓰면 이름이 고유한 원에서 글을 못 찾고(표본 46곳 중
    // 13곳만 노출), 최신순만 쓰면 100건 상한에 오래된 글이 잘려 동명 원이 되레 줄어든다.
    // 합집합은 표본 100곳에서 노출 30곳 → 57곳, 퇴보 0곳이었다.
    const merged = new Map<string, NaverBlogRawItem>();
    for (const item of [...titled(regionItems), ...recent]) {
        merged.set(item.link, item);
    }
    const matched = [...merged.values()].sort((a, b) => b.postdate.localeCompare(a.postdate));

    return NextResponse.json({
        total: matched.length,
        start,
        display,
        items: matched.slice(start - 1, start - 1 + display),
    });
}
