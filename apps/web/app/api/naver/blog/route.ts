import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query');
    if (!query) {
        return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const start = request.nextUrl.searchParams.get('start') ?? '1';
    const display = request.nextUrl.searchParams.get('display') ?? '5';
    const url = `https://naverapihub.apigw.ntruss.com/search/v1/blog?query=${encodeURIComponent(query)}&start=${start}&display=${display}`;

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

    const data = await response.json();
    return NextResponse.json(data);
}
