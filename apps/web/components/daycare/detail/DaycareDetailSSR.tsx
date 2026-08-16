import { cache } from 'react';
import { notFound } from 'next/navigation';
import { runPrefetch } from '@/lib/react-query/prefetch';
import { daycarePrefetch, fetchDaycareDetail } from '@/domain/daycare/server';
import { formatDate } from '@/lib/format';
import { HydrationBoundary } from '@tanstack/react-query';
import { getLatestPosts } from '@/lib/blog';
import DaycareDetailView from './DaycareDetailView';

type DaycareDetail = Awaited<ReturnType<typeof fetchDaycareDetail>>;

// generateMetadata와 Page 간 fetch 중복 제거 — 같은 request 내 dedup
export const getCachedDaycareDetail = cache(fetchDaycareDetail);

export function buildDaycareMetaStrings(daycare: DaycareDetail) {
    const year = new Date().getFullYear();
    const location = [daycare.sidoName, daycare.sigunguName].filter(Boolean).join(' ');
    const typeLabel = `${daycare.typeName}어린이집`;
    const buildTitle = (loc: string) =>
        loc
            ? `${daycare.name} (${year}) | ${loc} ${typeLabel} - 키즐리`
            : `${daycare.name} (${year}) | ${typeLabel} - 키즐리`;

    // 60자 초과 시 시군구를 생략해 시도명만으로 재구성 — 초장문 기관명 대응
    // (실측 최장 사례: DB 전수 조회 기준 63자 1건, 시도만 남기면 59자로 60자 이내)
    let title = buildTitle(location);
    if (title.length > 60 && daycare.sidoName) {
        title = buildTitle(daycare.sidoName);
    }

    const addressLine = daycare.address
        ? `${daycare.address} 소재 ${typeLabel}`
        : location
            ? `${location} 소재 ${typeLabel}`
            : typeLabel;

    const description = daycare.aiAnalysisSummary
        ? daycare.aiAnalysisSummary.slice(0, 155)
        : [
            addressLine,
            daycare.phone ? `전화 ${daycare.phone}` : null,
            '운영시간·대기현황은 키즐리에서 확인하세요.',
          ].filter(Boolean).join('. ');

    return { title, description };
}

export async function DaycareDetailSSR({ id }: { id: string }) {
    const [state, daycare] = await Promise.all([
        runPrefetch(daycarePrefetch.detail(id)),
        getCachedDaycareDetail(id),
    ]).catch(() => notFound());

    // "주변 다른 어린이집"은 보조 섹션 — 실패해도 페이지 전체를 404 처리하지 않음
    const nearbyState = await runPrefetch(
        daycarePrefetch.nearby({
            sigunguCode: daycare.sigunguCode,
            excludeId: id,
            latitude: daycare.latitude,
            longitude: daycare.longitude,
            limit: 10,
        })
    ).catch(() => null);

    const hydrationState = nearbyState
        ? { queries: [...state.queries, ...nearbyState.queries], mutations: state.mutations }
        : state;

    const { title, description } = buildDaycareMetaStrings(daycare);
    const daumDatetime = formatDate(daycare.syncedAt);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': ['ChildCare', 'LocalBusiness'],
        name: daycare.name,
        description,
        image: 'https://kidzly.kr/og-image.png',
        ...(daycare.syncedAt ? {
            dateModified: daycare.syncedAt,
            datePublished: daycare.syncedAt,
        } : {}),
        address: {
            '@type': 'PostalAddress',
            streetAddress: daycare.address,
            ...(daycare.sigunguName ? { addressLocality: daycare.sigunguName } : {}),
            ...(daycare.sidoName ? { addressRegion: daycare.sidoName } : {}),
            addressCountry: 'KR',
        },
        ...(daycare.phone ? { telephone: daycare.phone } : {}),
        ...(daycare.capacity !== null ? { maximumAttendeeCapacity: daycare.capacity } : {}),
        ...(daycare.staffTeacherCount !== null
            ? { numberOfEmployees: { '@type': 'QuantitativeValue', value: daycare.staffTeacherCount } }
            : {}),
        ...(daycare.latitude && daycare.longitude
            ? {
                geo: {
                    '@type': 'GeoCoordinates',
                    latitude: daycare.latitude,
                    longitude: daycare.longitude,
                },
            }
            : {}),
        url: `https://kidzly.kr/daycare/${id}`,
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: '키즐리',
                item: 'https://kidzly.kr',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: daycare.name,
                item: `https://kidzly.kr/daycare/${id}`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <div className="daum-wm-title hidden">{title}</div>
            {daumDatetime !== '-' && <div className="daum-wm-datetime hidden">{daumDatetime}</div>}
            <div className="daum-wm-content hidden">{description}</div>
            {/* 서버 렌더링 콘텐츠 블록 — Googlebot 초기 크롤용. 화면에는 표시되지 않고 JS 렌더링 완료 후 DaycareDetailView가 실제 UI를 담당함. */}
            <div className="sr-only" aria-hidden="true">
                <h1>{daycare.name}</h1>
                <p>{description}</p>
                {daycare.aiAnalysisSummary && <p>{daycare.aiAnalysisSummary}</p>}
                {daycare.address && <p>주소: {daycare.address}</p>}
                {daycare.phone && <p>전화: {daycare.phone}</p>}
                {daycare.typeName && <p>유형: {daycare.typeName}어린이집</p>}
                {daycare.sidoName && daycare.sigunguName && (
                    <p>지역: {daycare.sidoName} {daycare.sigunguName}</p>
                )}
                {daycare.certifiedDate && (
                    <p>인허가일: {daycare.certifiedDate}</p>
                )}
                {daycare.capacity !== null && (
                    <p>정원: {daycare.capacity}명</p>
                )}
            </div>
            <HydrationBoundary state={hydrationState}>
                <DaycareDetailView id={id} latestPosts={getLatestPosts(4)} />
            </HydrationBoundary>
        </>
    );
}
