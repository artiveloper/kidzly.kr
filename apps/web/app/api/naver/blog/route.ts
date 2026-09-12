import { NextRequest, NextResponse } from 'next/server';
import type { NaverBlogRawResponse } from '@/domain/naver-blog';

/**
 * 네이버 검색은 "창신어린이집"을 토막 내 매칭해서 무관한 글이 대부분이고, 쓸 만한 글은
 * 연관순 뒤쪽에 묻힌다. 표본 40곳 중 제목 매칭이 걸린 13곳 가운데 12곳은 상위 5건만
 * 받았으면 놓쳤다. 호출 수는 그대로(1회)이고 응답만 커진다.
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
    // 제목에 이름이 박힌 글만 그 어린이집을 다룬 글이다. 본문이나 해시태그에 이름만 스친
    // 동네 목록·분양 홍보 글은 후기가 아니라 언급이라 거른다.
    const matched = (data.items ?? []).filter((item) => mentionsName(item.title, name));

    return NextResponse.json({
        total: matched.length,
        start,
        display,
        items: matched.slice(start - 1, start - 1 + display),
    });
}
