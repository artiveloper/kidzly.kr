import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Flame, Clock, Users } from 'lucide-react';
import { fetchDaycareRankingWaiting, fetchDaycareRankingCapacity, fetchDaycareRankingOldest } from '@/domain/daycare/server';
import { SIDO_LIST, isValidSido } from '@/domain/region';
import { WaitingRankingList } from '@/components/rankings/WaitingRankingList';
import { RecentRankingList } from '@/components/rankings/RecentRankingList';
import { CapacityRankingList } from '@/components/rankings/CapacityRankingList';

import { SidoFilter } from '@/components/rankings/SidoFilter';
import { ShareButton } from '@/components/rankings/ShareButton';
import { Footer } from '@/components/common/Footer';

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

    const [waiting, capacity, oldest] = await Promise.all([
        fetchDaycareRankingWaiting(10, validSido),
        fetchDaycareRankingCapacity(10, validSido),
        fetchDaycareRankingOldest(10, validSido),
    ]);

    const pageUrl = validSido
        ? `${BASE_URL}/rankings?sido=${encodeURIComponent(validSido)}`
        : `${BASE_URL}/rankings`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${regionLabel} 어린이집 랭킹 | 키즐리`,
        description: `${regionLabel} 입소 대기·정원·역사 기준 어린이집 순위`,
        url: pageUrl,
        itemListElement: waiting.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            url: `${BASE_URL}/daycare/${item.id}`,
        })),
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '키즐리', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: '어린이집 랭킹', item: pageUrl },
        ],
    };

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

            <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
                <Link href="/" aria-label="홈으로">
                    <Image src="/logo.png" alt="키즐리" width={60} height={28} priority />
                </Link>
                <Link
                    href="/"
                    className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors py-3 pl-2 -mr-1"
                >
                    <ArrowLeft size={14} />
                    지도로 보기
                </Link>
            </header>

            <main className="pt-14">
                {/* 페이지 소개 */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-lg mx-auto px-4 pt-7 pb-6">
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

                <div className="max-w-lg mx-auto px-4 pb-12 space-y-10 pt-6">

                    {/* 지역 필터 */}
                    <SidoFilter currentSido={validSido} />

                    {/* 대기 많은 순 */}
                    <section id="waiting" className="scroll-mt-16">
                        <div className="mb-4">
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-3 py-1 mb-3 border border-red-100">
                                <Flame size={11} />
                                핫이슈
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-1">
                                {regionLabel} 입소 대기 TOP 10
                            </h2>
                            <p className="text-xs text-gray-400">정상 운영 어린이집 중 입소 대기 아동이 가장 많은 곳</p>
                        </div>
                        <WaitingRankingList items={waiting} />
                    </section>

                    {/* 정원 많은 순 */}
                    <section id="capacity" className="scroll-mt-16">
                        <div className="mb-4">
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-3 py-1 mb-3 border border-blue-100">
                                <Users size={11} />
                                정원 순위
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-1">
                                {regionLabel} 정원 많은 어린이집 TOP 10
                            </h2>
                            <p className="text-xs text-gray-400">정원 규모가 가장 큰 어린이집</p>
                        </div>
                        <CapacityRankingList items={capacity} />
                    </section>

                    {/* 가장 오래된 */}
                    <section id="oldest" className="scroll-mt-16">
                        <div className="mb-4">
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 rounded-full px-3 py-1 mb-3 border border-amber-100">
                                <Clock size={11} />
                                역사
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-1">
                                {regionLabel} 가장 오래된 어린이집 TOP 10
                            </h2>
                            <p className="text-xs text-gray-400">인가일 기준 가장 역사가 긴 어린이집</p>
                        </div>
                        <RecentRankingList items={oldest} />
                    </section>

                    {/* CTA */}
                    <div className="p-4 bg-white rounded-xl border border-gray-100 text-center">
                        <p className="text-sm font-semibold text-gray-900 mb-1">내 주변 어린이집이 궁금하신가요?</p>
                        <p className="text-xs text-gray-400 mb-3">지도에서 위치·대기·정원을 한눈에 확인하세요.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-4 py-2 rounded-lg transition-colors"
                        >
                            어린이집 찾아보기
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
