import { Suspense } from 'react';
import { Flame, Clock, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { runPrefetch } from '@/lib/react-query/prefetch';
import { buildRegionPath } from '@/domain/region';
import { daycarePrefetch, fetchDaycareRankingWaiting } from '@/domain/daycare/server';
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider';
import RankingsLists from '@/components/rankings/RankingsLists';
import { RankingsListsSkeleton } from '@/components/rankings/RankingsSkeleton';
import SidoFilter from '@/components/rankings/SidoFilter';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const BASE_URL = 'https://kidzly.kr';

// ItemList 구조화 데이터에 넣을 항목 수 — 화면의 대기 많은 순 목록(기본 10건)과 일치시킨다
const ITEM_LIST_SIZE = 10;

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

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '키즐리', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: '어린이집 랭킹', item: pageUrl },
        ],
    };

    const [state, waitingRanking] = await Promise.all([
        runPrefetch(
            daycarePrefetch.rankingWaiting({ sido }),
            daycarePrefetch.rankingCapacity({ sido }),
            daycarePrefetch.rankingOldest({ sido }),
        ),
        // prefetch와 같은 데이터를 한 번 더 조회한다 — ItemList는 dehydrate된 상태가 아니라 실제 배열이
        // 필요하고, dedup하려면 클라이언트에서도 쓰는 API 함수에 cache()를 씌워 경계가 흐려진다.
        // revalidate 3600 ISR 페이지(전국 1 + 시도 17)라 중복 1회 비용이 무시할 수준이다.
        fetchDaycareRankingWaiting(ITEM_LIST_SIZE, sido),
    ]);

    // 페이지의 주 목록 하나만 마크업한다 — 세 랭킹을 모두 ItemList로 내면 주 콘텐츠가 모호해진다.
    // 구글은 ListItem 2개 이상을 요구하므로 그 미만이면 마크업 자체를 내보내지 않는다.
    const itemListLd =
        waitingRanking.length >= 2
            ? {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: `${regionLabel} 어린이집 랭킹 | 키즐리`,
                description: `${regionLabel} 입소 대기가 많은 어린이집 순위`,
                url: pageUrl,
                numberOfItems: waitingRanking.length,
                // 랭킹 데이터는 매일 동기화되고 페이지는 ISR로 재생성된다 — 재생성 시각을 최신성 신호로 노출
                dateModified: new Date().toISOString(),
                itemListElement: waitingRanking.map((item, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: item.name,
                    url: `${BASE_URL}/daycare/${item.id}`,
                })),
            }
            : null;

    return (
        <div className="min-h-screen bg-gray-50">
            {itemListLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
                />
            )}
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
                        <h1 className="mb-1 text-xl font-bold text-gray-900">
                            {regionLabel} 어린이집 랭킹
                        </h1>
                        <p className="mb-2 text-sm leading-relaxed text-gray-500">
                            이 페이지는 {regionLabel} 어린이집을 입소 대기, 정원 규모, 운영 역사 세 가지 기준으로 순위를 매긴 목록입니다. 정부 공공 데이터를 매일 자동 갱신해 대기가 많은 어린이집부터 가장 오래된 어린이집까지 한눈에 비교할 수 있습니다.
                        </p>
                        <p className="mb-5 text-xs text-gray-400">
                            매일 자동 갱신 · 출처: 어린이집 정보공개포털
                        </p>
                        <nav aria-label="랭킹 목차" className="grid grid-cols-3 gap-2">
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
                                        <p className="text-sm font-bold text-gray-800 leading-snug">{label}</p>
                                        <p className="text-xs text-gray-400 leading-snug mt-0.5">{description}</p>
                                    </div>
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>

                <HydrationBoundary state={state}>
                    <div className="max-w-2xl mx-auto px-4 pb-12 space-y-10 pt-6">
                        <SidoFilter sido={sido} />
                        <Suspense fallback={<RankingsListsSkeleton />}>
                            <RankingsLists sido={sido} />
                        </Suspense>

                        {/* 위(랭킹 TOP10)→아래(지역별 전체 목록)로 연결하는 상호 링크 피라미드 —
                            /region 폐지 후 /daycares 지역별 탭으로 안내, 시도 경로로
                            시군구 칩 화면까지 바로 진입 */}
                        {sido && (
                            <Link
                                href={buildRegionPath(sido)}
                                className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 active:bg-gray-200"
                            >
                                <span className="text-2xl">📍</span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {sido} 지역별 전체 목록 보기
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        시군구별 어린이집 전체 목록을 확인하세요
                                    </p>
                                </div>
                                <ChevronRight size={16} className="shrink-0 text-gray-400" />
                            </Link>
                        )}
                    </div>
                </HydrationBoundary>
            </main>

            <Footer />
        </div>
    );
}
