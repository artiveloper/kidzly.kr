import { cache, Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { runPrefetch } from '@/lib/react-query/prefetch';
import { daycarePrefetch, fetchDaycareDetail } from '@/domain/daycare/server';
import { formatDate } from '@/lib/format';
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider';
import { DaycareDetailView } from '@/components/daycare/detail/DaycareDetailView';
import { DaycareDetailLoading } from '@/components/daycare/detail/DaycareDetailLoading';

type Props = {
    params: Promise<{ id: string }>;
};

// generateMetadata와 page 간 fetch 중복 제거
const getCachedDaycareDetail = cache(fetchDaycareDetail);

type DaycareDetail = Awaited<ReturnType<typeof fetchDaycareDetail>>;

function buildDaycareMetaStrings(daycare: DaycareDetail) {
    const year = new Date().getFullYear();
    const location = [daycare.sidoName, daycare.sigunguName].filter(Boolean).join(' ');
    const typeLabel = `${daycare.typeName}어린이집`;
    const title = location
        ? `${daycare.name} (${year}) | ${location} ${typeLabel} - 키즐리`
        : `${daycare.name} (${year}) | ${typeLabel} - 키즐리`;

    const addressLine = daycare.address
        ? `${daycare.address} 소재 ${typeLabel}`
        : location
            ? `${location} 소재 ${typeLabel}`
            : typeLabel;

    const description = [
        addressLine,
        daycare.phone ? `전화 ${daycare.phone}` : null,
        '운영시간·대기현황은 키즐리에서 확인하세요.',
    ].filter(Boolean).join('. ');

    return { title, description };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    try {
        const daycare = await getCachedDaycareDetail(id);

        const { title, description } = buildDaycareMetaStrings(daycare);

        const url = `https://kidzly.kr/daycare/${id}`;

        return {
            title: { absolute: title },
            description,
            alternates: { canonical: url },
            openGraph: {
                type: 'article',
                url,
                title,
                description,
                images: [{ url: '/og-image.png', width: 1200, height: 630 }],
                ...(daycare.syncedAt ? {
                    modifiedTime: daycare.syncedAt,
                    publishedTime: daycare.syncedAt,
                } : {}),
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
            },
        };
    } catch {
        return {
            title: '어린이집 정보 | 키즐리',
            alternates: { canonical: `https://kidzly.kr/daycare/${id}` },
        };
    }
}

export default async function Page({ params }: Props) {
    const { id } = await params;

    const [state, daycare] = await Promise.all([
        runPrefetch(daycarePrefetch.detail(id)),
        getCachedDaycareDetail(id),
    ]).catch(() => notFound());

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
            <HydrationBoundary state={state}>
                <div className="min-h-screen bg-gray-50">
                    <div className="mx-auto max-w-2xl bg-white shadow-sm">
                        <Suspense fallback={<DaycareDetailLoading />}>
                            <DaycareDetailView id={id} />
                        </Suspense>
                    </div>
                </div>
            </HydrationBoundary>
        </>
    );
}
