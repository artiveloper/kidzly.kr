import type { Metadata } from 'next';

const BASE_URL = 'https://kidzly.kr';

// 전국(sido 없음)과 지역별 랭킹 페이지가 공유하는 메타데이터 빌더.
// canonical·openGraph.url을 경로형 URL로 통일해 GSC "Page with redirect"/중복 이슈를 방지한다.
export function buildRankingsMetadata(sido?: string): Metadata {
    const regionLabel = sido ?? '전국';
    const title = `${regionLabel} 어린이집 랭킹 | 대기·정원·역사 순위 - 키즐리`;
    const description = `${regionLabel} 입소 대기가 많은 어린이집, 정원이 많은 어린이집, 가장 오래된 어린이집 순위를 한눈에 확인하세요.`;
    const url = sido ? `${BASE_URL}/rankings/${encodeURIComponent(sido)}` : `${BASE_URL}/rankings`;

    return {
        title: { absolute: title },
        description,
        alternates: { canonical: url },
        openGraph: {
            type: 'website',
            locale: 'ko_KR',
            siteName: '키즐리',
            url,
            title,
            description,
            images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '어린이집 랭킹 키즐리' }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png'],
        },
    };
}
