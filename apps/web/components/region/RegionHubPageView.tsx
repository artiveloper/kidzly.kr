import { cache, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { runPrefetch } from '@/lib/react-query/prefetch';
import { daycarePrefetch, fetchDaycaresBySigungu } from '@/domain/daycare/server';
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider';
import { getSidoShort, buildRegionPath } from '@/domain/region';
import Breadcrumb from '@/components/common/Breadcrumb';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import RegionDaycareList from './RegionDaycareList';
import RegionDaycareListSkeleton from './RegionDaycareListSkeleton';
import RegionDaycareListError from './RegionDaycareListError';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const BASE_URL = 'https://kidzly.kr';

// generateMetadata와 본문 간 fetch 중복 제거 — 같은 request 내 dedup
// (DaycareDetailSSR.tsx의 getCachedDaycareDetail과 동일 패턴)
export const getCachedRegionCount = cache((sido: string, sigungu: string) =>
    fetchDaycaresBySigungu(sido, sigungu, { limit: 1 })
);

type Props = {
    sido: string;
    sigungu: string;
};

export default async function RegionHubPageView({ sido, sigungu }: Props) {
    // totalCount만 필요하므로 limit:1로 최소 조회 — ISR 재검증 시 활성 어린이집이 0곳이 된
    // 지역을 자동 404 전환하는 자연 치유 장치(dynamicParams=false와 이중 방어)
    const { totalCount } = await getCachedRegionCount(sido, sigungu);
    if (totalCount === 0) notFound();

    const shortSido = getSidoShort(sido);
    const regionLabel = `${shortSido} ${sigungu}`;
    const regionPath = buildRegionPath(sido, sigungu);
    const pageUrl = `${BASE_URL}${regionPath}`;
    const rankingsUrl = `${BASE_URL}/rankings/${encodeURIComponent(sido)}`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${regionLabel} 어린이집 목록 | 키즐리`,
        description: `${regionLabel} 정상 운영 어린이집 ${totalCount}곳 목록`,
        url: pageUrl,
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '키즐리', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: `${shortSido} 랭킹`, item: rankingsUrl },
            { '@type': 'ListItem', position: 3, name: sigungu, item: pageUrl },
        ],
    };

    const state = await runPrefetch(daycarePrefetch.regionList({ sido, sigungu }));

    return (
        <div className="min-h-screen bg-gray-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <div className="daum-wm-title hidden">{`${regionLabel} 어린이집 전체 목록 (${totalCount}곳) - 키즐리`}</div>
            <div className="daum-wm-content hidden">{`${regionLabel}에 있는 정상 운영 어린이집 ${totalCount}곳의 이름과 주소를 확인하세요.`}</div>

            <Header />

            <main className="pt-14">
                <div className="border-b border-gray-100 bg-white">
                    <div className="mx-auto max-w-2xl px-4 pt-5 pb-6">
                        <Breadcrumb
                            items={[
                                { label: '홈', href: '/' },
                                { label: `${shortSido} 랭킹`, href: `/rankings/${encodeURIComponent(sido)}` },
                                { label: sigungu },
                            ]}
                        />
                        <h1 className="mt-3 mb-1 text-xl font-bold text-gray-900">
                            {regionLabel} 어린이집
                        </h1>
                        <p className="text-sm text-gray-500">
                            정상 운영 중인 어린이집 {totalCount}곳을 확인하세요.
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-2xl px-4 pt-6 pb-12">
                    <HydrationBoundary state={state}>
                        <ErrorBoundary fallback={<RegionDaycareListError />}>
                            <Suspense fallback={<RegionDaycareListSkeleton />}>
                                <RegionDaycareList sido={sido} sigungu={sigungu} />
                            </Suspense>
                        </ErrorBoundary>
                    </HydrationBoundary>
                </div>
            </main>

            <Footer />
        </div>
    );
}
