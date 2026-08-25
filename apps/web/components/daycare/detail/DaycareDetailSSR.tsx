import { cache } from 'react';
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

    // description은 구조화 실데이터(주소·정원·현원·교사·운영연차·전화) 기반으로 구성 — 레코드마다 값이 달라 중복
    // title/description 리스크가 구조적으로 낮다. AI 요약(aiAnalysisSummary)은 프로필이 비슷한 어린이집끼리 문장이
    // 수렴할 수 있어 메타 description에서는 제외하고, 본문(DaycareDetailContent)에만 유지한다.
    const certifiedYear = daycare.certifiedDate ? parseInt(daycare.certifiedDate.slice(0, 4)) : NaN;
    const yearsSince = !isNaN(certifiedYear) ? year - certifiedYear + 1 : null;
    // 주소가 긴 레코드(건물명·동호수 포함)에서 155자를 넘을 수 있어 방어적으로 캡
    const description = ([
        addressLine,
        daycare.capacity !== null ? `정원 ${daycare.capacity}명` : null,
        daycare.currentChildCount !== null ? `현원 ${daycare.currentChildCount}명` : null,
        daycare.staffTeacherCount !== null ? `교사 ${daycare.staffTeacherCount}명` : null,
        yearsSince !== null ? `${yearsSince}년차` : null,
        daycare.phone ? `전화 ${daycare.phone}` : null,
    ].filter(Boolean).join(', ') + '. 운영시간·상세 정보는 키즐리에서 확인하세요.').slice(0, 155);

    return { title, description };
}

export async function DaycareDetailSSR({ id }: { id: string }) {
    // 존재하지 않는 id는 Page에서 이미 404로 걸러졌다. 여기서 실패하면 DB 조회 실패이므로
    // 404로 뭉개지 않고 그대로 던져 5xx로 응답한다 — 검색로봇이 나중에 재수집한다.
    const [state, daycare] = await Promise.all([
        runPrefetch(daycarePrefetch.detail(id)),
        getCachedDaycareDetail(id),
    ]);

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
            <HydrationBoundary state={hydrationState}>
                <DaycareDetailView id={id} latestPosts={getLatestPosts(4)} />
            </HydrationBoundary>
        </>
    );
}
