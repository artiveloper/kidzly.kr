import { NextRequest, NextResponse } from 'next/server';
import type { NaverBlogRawItem, NaverBlogRawResponse } from '@/domain/naver-blog';

/**
 * 네이버 검색은 "창신어린이집"을 토막 내 매칭해서 이름이 한 번도 안 나오는 글이 대부분이다.
 * 상위 5건만 받으면 실제로 그 어린이집을 언급한 글이 걸리는 비율이 표본 40곳 중 13%뿐이었고,
 * 100건까지 훑으면 65%로 올라간다. 호출 수는 그대로(1회)이고 응답만 커진다.
 */
const UPSTREAM_DISPLAY = 100;

function normalize(text: string): string {
    return text.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
}

function mentionsName(text: string, name: string): boolean {
    return normalize(text).includes(normalize(name));
}

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query');
    const name = request.nextUrl.searchParams.get('name');
    if (!query || !name) {
        return NextResponse.json({ error: 'query and name are required' }, { status: 400 });
    }

    const start = Number(request.nextUrl.searchParams.get('start') ?? '1');
    const display = Number(request.nextUrl.searchParams.get('display') ?? '5');

    // 상위 요청 URL을 start·display와 무관하게 고정한다. 무한 스크롤 다음 페이지가 같은
    // 캐시 항목을 재사용해, 어린이집 한 곳당 네이버 호출은 1시간에 한 번으로 유지된다.
    const url = `https://naverapihub.apigw.ntruss.com/search/v1/blog?query=${encodeURIComponent(query)}&start=1&display=${UPSTREAM_DISPLAY}`;

    const response = await fetch(url, {
        headers: {
            'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_API_HUB_CLIENT_ID ?? '',
            'X-NCP-APIGW-API-KEY': process.env.NAVER_API_HUB_CLIENT_SECRET ?? '',
        },
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch naver blog' }, { status: response.status });
    }

    const data: NaverBlogRawResponse = await response.json();
    const matched = (data.items ?? []).filter((item: NaverBlogRawItem) =>
        mentionsName(`${item.title}${item.description}`, name)
    );
    // 제목에 이름이 박힌 글이 그 어린이집을 다룬 글이다. 동네 목록·해시태그에 이름만
    // 스친 글보다 앞세운다 — sort가 안정 정렬이라 그룹 안에서는 네이버 연관순이 남는다.
    const ranked = [...matched].sort(
        (a, b) => Number(mentionsName(b.title, name)) - Number(mentionsName(a.title, name))
    );

    return NextResponse.json({
        total: ranked.length,
        start,
        display,
        items: ranked.slice(start - 1, start - 1 + display),
    });
}
