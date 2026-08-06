import type { Metadata } from 'next';
import { getSidoShort, buildRegionPath } from '@/domain/region';

const BASE_URL = 'https://kidzly.kr';

// /region/[sido]/[sigungu] 허브 페이지 메타데이터 빌더 — totalCount는 generateMetadata에서
// fetchDaycaresBySigungu(limit:1)로 최소 조회해 전달한다.
export function buildRegionMetadata(sido: string, sigungu: string, totalCount: number): Metadata {
    const shortSido = getSidoShort(sido);
    const regionLabel = `${shortSido} ${sigungu}`;
    const title = `${regionLabel} 어린이집 전체 목록 (${totalCount}곳) - 키즐리`;
    const description = `${regionLabel}에 있는 정상 운영 어린이집 ${totalCount}곳의 이름·유형·주소를 한눈에 확인하세요.`;
    const url = `${BASE_URL}${buildRegionPath(sido, sigungu)}`;

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
            images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${regionLabel} 어린이집 목록 키즐리` }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png'],
        },
    };
}

// /region/[sido] 시도 인덱스 페이지(시군구 전체 목록) 메타데이터 빌더 —
// sigunguCount는 generateMetadata에서 fetchSigunguListBySido(sido)로 조회한 배열 길이를 전달한다.
export function buildRegionSidoMetadata(sido: string, sigunguCount: number): Metadata {
    const title = `${sido} 어린이집 지역별 전체 목록 - 키즐리`;
    const description = `${sido} 시군구별(${sigunguCount}곳) 정상 운영 어린이집 목록을 한눈에 확인하세요.`;
    const url = `${BASE_URL}/region/${encodeURIComponent(sido)}`;

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
            images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${sido} 어린이집 지역별 목록 키즐리` }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png'],
        },
    };
}
