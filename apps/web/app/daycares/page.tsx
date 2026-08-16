import type { Metadata } from 'next'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { SIDO_LIST, SIDO_SHORT } from '@/domain/region'
import { fetchSigunguNames } from '@/domain/region/server'
import type { SigunguEntry } from '@/domain/region'
import { daycarePrefetch, fetchDaycareRankingUpcoming } from '@/domain/daycare/server'
import { runPrefetch } from '@/lib/react-query/prefetch'
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import SidoChipList from '@/components/region/SidoChipList'
import UpcomingDaycareList from '@/components/home/UpcomingDaycareList'

const BASE_URL = 'https://kidzly.kr'
const TITLE = '어린이집 목록 | 지역별·인허가예정 - 키즐리'
const DESCRIPTION = '지역별 어린이집 목록과 인허가 예정 어린이집을 한곳에서 확인하세요.'

export const revalidate = 3600

export const metadata: Metadata = {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: `${BASE_URL}/daycares` },
    openGraph: {
        type: 'website',
        locale: 'ko_KR',
        siteName: '키즐리',
        url: `${BASE_URL}/daycares`,
        title: TITLE,
        description: DESCRIPTION,
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '어린이집 목록 키즐리' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/og-image.png'],
    },
}

const TABS = [
    { key: 'region', label: '지역별' },
    { key: 'upcoming', label: '인허가예정' },
] as const

type Props = {
    searchParams: Promise<{ tab?: string; sido?: string; sigungu?: string }>
}

export default async function DaycaresPage({ searchParams }: Props) {
    const { tab, sido, sigungu } = await searchParams
    const activeTab = tab === 'upcoming' ? 'upcoming' : 'region'

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-14">
                <div className="bg-white border-b border-gray-100">
                    <div className="mx-auto max-w-2xl px-4 pt-7 pb-6">
                        <h1 className="mb-1 text-xl font-bold text-gray-900">어린이집 목록</h1>
                        <p className="text-sm text-gray-400">
                            지역별로 찾아보거나, 곧 인허가될 어린이집을 미리 확인하세요.
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-2xl px-4 flex gap-1">
                    {TABS.map((t) => (
                        <Link
                            key={t.key}
                            href={t.key === 'region' ? '/daycares' : `/daycares?tab=${t.key}`}
                            className={cn(
                                'px-4 py-2.5 text-base md:text-lg font-bold border-b-2 transition-colors',
                                activeTab === t.key
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-gray-400 hover:text-gray-600',
                            )}
                        >
                            {t.label}
                        </Link>
                    ))}
                </div>

                <div className="mx-auto max-w-2xl px-4 pt-6 pb-12">
                    {activeTab === 'region' ? (
                        <RegionSection sido={sido} sigungu={sigungu} />
                    ) : (
                        <UpcomingSection />
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}

// 시군구 목록을 시도별로 묶어 SidoChipList의 2단계 칩 전환에 사용
function groupBySido(entries: SigunguEntry[]): Record<string, SigunguEntry[]> {
    const map: Record<string, SigunguEntry[]> = {}
    for (const entry of entries) {
        ;(map[entry.sido] ??= []).push(entry)
    }
    return map
}

async function RegionSection({ sido, sigungu }: { sido?: string; sigungu?: string }) {
    const entries = await fetchSigunguNames()
    const sigunguBySido = groupBySido(entries)

    // sido=&sigungu= 딥링크로 들어온 경우 초기 로드부터 해당 지역 목록을 prefetch —
    // sigunguBySido와 대조해 유효한 조합일 때만 (SidoChipList의 클라이언트 검증과 동일 기준)
    if (sido && sigungu && sigunguBySido[sido]?.some((entry) => entry.sigungu === sigungu)) {
        const state = await runPrefetch(daycarePrefetch.regionList({ sido, sigungu }))
        return (
            <HydrationBoundary state={state}>
                <SidoChipList sigunguBySido={sigunguBySido} />
            </HydrationBoundary>
        )
    }

    return <SidoChipList sigunguBySido={sigunguBySido} />
}

// 현재 전국 6건 수준이라 사실상 전수 노출 — 데이터 이상 유입 대비 안전장치로만 상한을 둔다
const UPCOMING_LIMIT = 100

async function UpcomingSection() {
    const [upcomingAll, ...upcomingBySido] = await Promise.all([
        fetchDaycareRankingUpcoming(UPCOMING_LIMIT),
        ...SIDO_LIST.map((sido) => fetchDaycareRankingUpcoming(UPCOMING_LIMIT, sido)),
    ])
    const regions = [
        { key: '전체', label: '전체', items: upcomingAll },
        ...SIDO_LIST.map((sido, i) => ({ key: sido, label: SIDO_SHORT[sido], items: upcomingBySido[i] ?? [] })),
    ]

    return <UpcomingDaycareList regions={regions} />
}
