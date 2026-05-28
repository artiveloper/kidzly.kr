import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query');
    if (!query) {
        return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const start = request.nextUrl.searchParams.get('start') ?? '1';
    const display = request.nextUrl.searchParams.get('display') ?? '5';
    const url = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&start=${start}&display=${display}`;

    const response = await fetch(url, {
        headers: {
            'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID ?? '',
            'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET ?? '',
        },
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch naver blog' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
}
