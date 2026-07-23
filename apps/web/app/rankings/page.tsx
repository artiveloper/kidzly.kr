import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Flame, Clock, Users } from 'lucide-react';
import { isValidSido } from '@/domain/region';
import { runPrefetch } from '@/lib/react-query/prefetch';
import { daycarePrefetch } from '@/domain/daycare/server';
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider';
import RankingsContent from '@/components/rankings/RankingsContent';
import RankingsSkeleton from '@/components/rankings/RankingsSkeleton';
import ShareButton from '@/components/rankings/ShareButton';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export const revalidate = 3600;

const BASE_URL = 'https://kidzly.kr';

type Props = {
    searchParams: Promise<{ sido?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { sido } = await searchParams;
    const validSido = sido && isValidSido(sido) ? sido : undefined;

    const regionLabel = validSido ?? '전국';
    const title = `${regionLabel} 어린이집 랭킹 | 대기·정원·역사 순위 - 키즐리`;
    const description = `${regionLabel} 입소 대기가 많은 어린이집, 정원이 많은 어린이집, 가장 오래된 어린이집 순위를 한눈에 확인하세요.`;
    const url = validSido
        ? `${BASE_URL}/rankings?sido=${encodeURIComponent(validSido)}`
        : `${BASE_URL}/rankings`;

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

export default async function RankingsPage({ searchParams }: Props) {
    const { sido } = await searchParams;
    const validSido = sido && isValidSido(sido) ? sido : undefined;

    const regionLabel = validSido ?? '전국';

    const pageUrl = validSido
        ? `${BASE_URL}/rankings?sido=${encodeURIComponent(validSido)}`
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
        daycarePrefetch.rankingWaiting({ sido: validSido }),
        daycarePrefetch.rankingCapacity({ sido: validSido }),
        daycarePrefetch.rankingOldest({ sido: validSido }),
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
                            <h1 className="text-xl font-bold text-gray-900">어린이집 랭킹</h1>
                            <ShareButton
                                title={`${regionLabel} 어린이집 랭킹 | 키즐리`}
                                url={validSido
                                    ? `${BASE_URL}/rankings?sido=${encodeURIComponent(validSido)}`
                                    : `${BASE_URL}/rankings`
                                }
                            />
                        </div>
                        <p className="text-sm text-gray-400 mb-5">
                            다양한 기준으로 전국 어린이집을 비교해보세요.
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
                    <Suspense fallback={<RankingsSkeleton />}>
                        <RankingsContent />
                    </Suspense>
                </HydrationBoundary>
            </main>

            <Footer />
        </div>
    );
}
