import { Suspense } from 'react';
import { Flame, Clock, Users } from 'lucide-react';
import { runPrefetch } from '@/lib/react-query/prefetch';
import { daycarePrefetch } from '@/domain/daycare/server';
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider';
import RankingsLists from '@/components/rankings/RankingsLists';
import { RankingsListsSkeleton } from '@/components/rankings/RankingsSkeleton';
import SidoFilter from '@/components/rankings/SidoFilter';
import ShareButton from '@/components/rankings/ShareButton';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const BASE_URL = 'https://kidzly.kr';

const SECTION_CARDS = [
    {
        id: 'waiting',
        icon: Flame,
        iconClass: 'text-red-500 bg-red-50',
        label: '대기 많은 순',
        description: '입소 경쟁이 치열한 어린이집',
    },
    {
        id: 'capacity',
        icon: Users,
        iconClass: 'text-blue-500 bg-blue-50',
        label: '정원 많은 순',
        description: '규모가 가장 큰 어린이집',
    },
    {
        id: 'oldest',
        icon: Clock,
        iconClass: 'text-amber-500 bg-amber-50',
        label: '가장 오래된',
        description: '역사가 긴 어린이집',
    },
] as const;

type Props = {
    // undefined = 전국(`/rankings`), 그 외 = 검증된 시도명(`/rankings/[sido]`)
    sido?: string;
};

export default async function RankingsPageView({ sido }: Props) {
    const regionLabel = sido ?? '전국';
    const pageUrl = sido
        ? `${BASE_URL}/rankings/${encodeURIComponent(sido)}`
        : `${BASE_URL}/rankings`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${regionLabel} 어린이집 랭킹 | 키즐리`,
        description: `${regionLabel} 입소 대기·정원·역사 기준 어린이집 순위`,
        url: pageUrl,
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '키즐리', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: '어린이집 랭킹', item: pageUrl },
        ],
    };

    const state = await runPrefetch(
        daycarePrefetch.rankingWaiting({ sido }),
        daycarePrefetch.rankingCapacity({ sido }),
        daycarePrefetch.rankingOldest({ sido }),
    );

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
            <div className="daum-wm-title hidden">{`${regionLabel} 어린이집 랭킹 | 대기·정원·역사 순위 - 키즐리`}</div>
            <div className="daum-wm-content hidden">{`${regionLabel} 입소 대기가 많은 어린이집, 정원이 많은 어린이집, 가장 오래된 어린이집 순위를 한눈에 확인하세요.`}</div>

            <Header />

            <main className="pt-14">
                {/* 페이지 소개 */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-2xl mx-auto px-4 pt-7 pb-6">
                        <div className="flex items-center justify-between gap-3 mb-1">
                            <h1 className="text-xl font-bold text-gray-900">
                                {regionLabel} 어린이집 랭킹
                            </h1>
                            <ShareButton
                                title={`${regionLabel} 어린이집 랭킹 | 키즐리`}
                                url={pageUrl}
                            />
                        </div>
                        <p className="text-sm text-gray-400 mb-5">
                            다양한 기준으로 {regionLabel} 어린이집을 비교해보세요.
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {SECTION_CARDS.map(({ id, icon: Icon, iconClass, label, description }) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm active:bg-gray-50 transition-all bg-white"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
                                        <Icon size={15} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 leading-snug">{label}</p>
                                        <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{description}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <HydrationBoundary state={state}>
                    <div className="max-w-2xl mx-auto px-4 pb-12 space-y-10 pt-6">
                        <SidoFilter sido={sido} />
                        <Suspense fallback={<RankingsListsSkeleton />}>
                            <RankingsLists sido={sido} />
                        </Suspense>
                    </div>
                </HydrationBoundary>
            </main>

            <Footer />
        </div>
    );
}
