import { cache, Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { runPrefetch } from '@/lib/react-query/prefetch';
import { daycarePrefetch, fetchDaycareDetail } from '@/domain/daycare/server';
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider';
import { DaycareDetailView } from '@/components/daycare/detail/DaycareDetailView';
import { DaycareDetailLoading } from '@/components/daycare/detail/DaycareDetailLoading';

type Props = {
    params: Promise<{ id: string }>;
};

// generateMetadata와 page 간 fetch 중복 제거
const getCachedDaycareDetail = cache(fetchDaycareDetail);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    try {
        const daycare = await getCachedDaycareDetail(id);

        const year = new Date().getFullYear();
        const locationParts = [daycare.sidoName, daycare.sigunguName].filter(Boolean).join(' ');
        const title = locationParts
            ? `${daycare.name} (${year}) - ${daycare.typeName} - ${locationParts} | 키즐리`
            : `${daycare.name} (${year}) - ${daycare.typeName} | 키즐리`;

        const detailParts = [
            daycare.capacity ? `정원 ${daycare.capacity}명` : null,
            daycare.ageRange ? `만 ${daycare.ageRange.min}~${daycare.ageRange.max}세 대상` : null,
        ].filter(Boolean).join(', ');

        const description = [
            locationParts ? `${locationParts} ${daycare.typeName}` : daycare.typeName,
            detailParts.length > 0 ? detailParts : null,
            '운영시간·대기 현황은 키즐리에서 확인하세요.',
        ].filter(Boolean).join('. ');

        const url = `https://kidzly.kr/daycare/${id}`;

        return {
            title,
            description,
            alternates: { canonical: url },
            openGraph: {
                type: 'website',
                url,
                title,
                description,
                images: [{ url: '/og-image.png', width: 1200, height: 630 }],
            },
            twitter: {
                card: 'summary',
                title,
                description,
            },
        };
    } catch {
        return { title: '어린이집 정보 | 키즐리' };
    }
}

export default async function Page({ params }: Props) {
    const { id } = await params;

    try {
        const [state, daycare] = await Promise.all([
            runPrefetch(daycarePrefetch.detail(id)),
            getCachedDaycareDetail(id),
        ]);

        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'ChildCare',
            name: daycare.name,
            address: {
                '@type': 'PostalAddress',
                streetAddress: daycare.address,
                addressCountry: 'KR',
            },
            ...(daycare.phone ? { telephone: daycare.phone } : {}),
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

        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
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
    } catch {
        notFound();
    }
}
