import type { Metadata } from 'next'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { formatLocation, getSidoShort } from '@/domain/region'
import { fetchSidoNames, fetchSigunguNames } from '@/domain/region/server'
import type { SigunguEntry } from '@/domain/region'
import {
    daycarePrefetch,
    fetchDaycareRankingUpcoming,
    loadDaycareFilters,
    toDaycareFilterParams,
} from '@/domain/daycare/server'
import { runPrefetch } from '@/lib/react-query/prefetch'
import { buildBreadcrumbJsonLd } from '@/lib/structured-data/breadcrumb'
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import SidoChipList from '@/components/region/SidoChipList'
import UpcomingDaycareList from '@/components/home/UpcomingDaycareList'

const BASE_URL = 'https://kidzly.kr'
const TITLE = '어린이집 목록 | 지역별·인허가예정 - 키즐리'
const DESCRIPTION = '지역별 어린이집 목록과 인허가 예정 어린이집을 한곳에서 확인하세요.'

export const revalidate = 3600

// arcode로 시군구가 특정된 화면은 지역마다 목록이 다른 별개의 페이지다. 지금까지는 제목·설명·
// canonical이 전 지역 동일해 구글이 전부 /daycares 하나로 합쳐버렸고, 250여 개 지역 페이지가
// 통째로 색인에서 빠져 있었다. 지역이 특정되면 세 값을 모두 그 지역 것으로 바꾼다.
async function findSigunguEntry(arcode: string | undefined): Promise<SigunguEntry | null> {
    if (!arcode) return null
    const entries = await fetchSigunguNames()
    return entries.find((entry) => entry.arcode === arcode) ?? null
}

function buildRegionStrings(entry: SigunguEntry) {
    // 세종처럼 시도와 시군구 이름이 같은 경우 formatLocation이 중복을 걷어낸다
    const location = formatLocation(entry.sido, entry.sigungu)

    return {
        location,
        heading: `${location} 어린이집`,
        title: `${location} 어린이집 | 국공립·민간·가정 목록 - 키즐리`,
        description: `${location}에 있는 어린이집을 유형·연령·지원서비스로 걸러 확인하세요. 정원과 현원, 주소까지 한 화면에서 비교할 수 있습니다.`,
        url: `${BASE_URL}/daycares?arcode=${entry.arcode}`,
    }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { arcode } = await searchParams
    const entry = await findSigunguEntry(arcode)
    // 유형·연령·지원서비스 필터는 같은 지역 목록의 부분집합이라 canonical에 싣지 않는다 —
    // 실으면 필터 조합만큼 URL이 늘어 색인이 잘게 쪼개진다
    const { title, description, url } = entry
        ? buildRegionStrings(entry)
        : { title: TITLE, description: DESCRIPTION, url: `${BASE_URL}/daycares` }

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
            images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '어린이집 목록 키즐리' }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png'],
        },
    }
}

const TABS = [
    { key: 'region', label: '지역별' },
    { key: 'upcoming', label: '인허가예정' },
] as const

// sido와 arcode는 배타적이다 — 시군구까지 선택된 상태는 ?arcode=11680, 시도만 선택된
// 상태는 ?sido=서울특별시. sido는 클라이언트(SidoChipList)에서만 소비하므로 여기선 읽지 않는다.
// 필터(vehicle/services/age)는 loadDaycareFilters로 읽어야 하므로 인덱스 시그니처를 함께 둔다.
type Props = {
    searchParams: Promise<
        { tab?: string; sido?: string; arcode?: string } & Record<string, string | string[] | undefined>
    >
}

export default async function DaycaresPage({ searchParams }: Props) {
    const params = await searchParams
    const { tab, arcode } = params
    const activeTab = tab === 'upcoming' ? 'upcoming' : 'region'
    // arcode는 지역별 탭에서만 의미를 가진다 (fetchSigunguNames는 cache()라 조회가 늘지 않는다)
    const region = activeTab === 'region' ? await findSigunguEntry(arcode).then((entry) => (entry ? buildRegionStrings(entry) : null)) : null

    const breadcrumbLd = buildBreadcrumbJsonLd([
        { name: '키즐리', url: BASE_URL },
        { name: '어린이집 목록', url: `${BASE_URL}/daycares` },
        ...(region ? [{ name: region.heading, url: region.url }] : []),
    ])

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <div className="daum-wm-title hidden">{region ? region.title : TITLE}</div>
            <div className="daum-wm-content hidden">{region ? region.description : DESCRIPTION}</div>
            <Header />

            <main className="pt-14">
                <div className="bg-white border-b border-gray-100">
                    <div className="mx-auto max-w-2xl px-4 pt-7 pb-6">
                        <h1 className="mb-1 text-xl font-bold text-gray-900">
                            {region ? region.heading : '어린이집 목록'}
                        </h1>
                        <p className="text-sm text-gray-400">
                            {region
                                ? `${region.location} 지역의 국공립·민간·가정 어린이집을 한 번에 확인하세요.`
                                : '지역별로 찾아보거나, 곧 인허가될 어린이집을 미리 확인하세요.'}
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
                        <RegionSection sido={params.sido} arcode={arcode} searchParams={params} />
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

// 지역을 옮겨도 살아남아야 하는 필터들 — 지역 칩 링크에 그대로 이어 붙인다.
// (nuqs는 배열 필터도 콤마로 이어 붙인 단일 문자열로 직렬화하므로 문자열만 통과시키면 된다)
const FILTER_KEYS = ['type', 'vehicle', 'services', 'age'] as const

function buildFilterQuery(searchParams: Record<string, string | string[] | undefined>) {
    const query = new URLSearchParams()
    for (const key of FILTER_KEYS) {
        const value = searchParams[key]
        if (typeof value === 'string' && value !== '') query.set(key, value)
    }
    return query.toString()
}

async function RegionSection({
    sido,
    arcode,
    searchParams,
}: {
    sido?: string
    arcode?: string
    searchParams: Record<string, string | string[] | undefined>
}) {
    const entries = await fetchSigunguNames()
    const sigunguBySido = groupBySido(entries)

    // arcode= 딥링크로 들어온 경우 초기 로드부터 해당 시군구 목록을 prefetch —
    // 엔트리 목록에 실재하는 코드일 때만 (SidoChipList의 클라이언트 검증과 동일 기준).
    // sido=만 들어온 1단계 상태는 선택된 시군구가 없어 조회할 목록도 없으므로 prefetch하지 않는다.
    const selectedEntry = arcode ? entries.find((entry) => entry.arcode === arcode) : undefined

    // 필터가 URL에 함께 실려 있으면 prefetch에도 반영해야 한다 — 반영하지 않으면
    // queryKey가 클라이언트 hook과 어긋나 목록이 떴다가 스켈레톤으로 교체된 뒤 다시 로드된다.
    const state = selectedEntry
        ? await runPrefetch(
              daycarePrefetch.regionList({
                  sigunguCode: selectedEntry.arcode,
                  ...toDaycareFilterParams(loadDaycareFilters(searchParams)),
              })
          )
        : null

    const chips = (
        <SidoChipList
            sigunguBySido={sigunguBySido}
            sido={sido}
            arcode={arcode}
            filterQuery={buildFilterQuery(searchParams)}
        />
    )

    return state ? <HydrationBoundary state={state}>{chips}</HydrationBoundary> : chips
}

// 현재 전국 6건 수준이라 사실상 전수 노출 — 데이터 이상 유입 대비 안전장치로만 상한을 둔다
const UPCOMING_LIMIT = 100

async function UpcomingSection() {
    const sidoNames = await fetchSidoNames()
    const [upcomingAll, ...upcomingBySido] = await Promise.all([
        fetchDaycareRankingUpcoming(UPCOMING_LIMIT),
        ...sidoNames.map((sido) => fetchDaycareRankingUpcoming(UPCOMING_LIMIT, sido)),
    ])
    const regions = [
        { key: '전체', label: '전체', items: upcomingAll },
        ...sidoNames.map((sido, i) => ({ key: sido, label: getSidoShort(sido), items: upcomingBySido[i] ?? [] })),
    ]

    return <UpcomingDaycareList regions={regions} />
}
