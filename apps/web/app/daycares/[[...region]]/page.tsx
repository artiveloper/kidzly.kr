// 어린이집 지역별 목록 — /daycares(시도 선택) · /daycares/{시도} · /daycares/{시도}/{시군구} 3단계 경로
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import {
    buildRegionPath,
    formatLocation,
    getSidoShort,
    resolveRegionSegments,
} from '@/domain/region'
import { fetchSigunguNames } from '@/domain/region/server'
import type { RegionResolution, RegionSelection, SigunguEntry } from '@/domain/region'
import { loadDaycareFilters, toDaycareFilterParams } from '@/domain/daycare/server'
import { buildBreadcrumbJsonLd } from '@/lib/structured-data/breadcrumb'
import DaycaresShell from '@/components/daycare/list/DaycaresShell'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import SidoChipList from '@/components/region/SidoChipList'
import RegionDaycareListSSR from '@/components/region/RegionDaycareListSSR'
import RegionDaycareListSkeleton from '@/components/region/RegionDaycareListSkeleton'
import RegionDaycareListError from '@/components/region/RegionDaycareListError'

const BASE_URL = 'https://kidzly.kr'
const TITLE = '어린이집 목록 | 지역별·인허가예정 - 키즐리'
const DESCRIPTION =
    '시·군·구별 어린이집 목록을 국공립·민간·가정 유형과 연령·지원서비스로 걸러 확인하세요. 정원과 현원, 주소까지 한 화면에서 비교하고, 곧 문을 여는 인허가 예정 어린이집 정보도 함께 살펴볼 수 있습니다.'

export const revalidate = 3600

// 이 세그먼트에는 loading.tsx를 두지 않는다 — 라우트 단위 Suspense가 붙으면 셸이 먼저 전송돼
// 아래의 notFound()·permanentRedirect()가 HTTP 상태에 반영되지 못하고, 없는 지역이 "200 + 404 화면"
// (soft 404)으로, 옛 쿼리 URL이 308 대신 200으로 나간다. 스트리밍은 각 섹션의 <Suspense>가 맡는다.

// 지역은 경로로 특정된다 — 지역마다 목록이 다른 별개의 페이지라 제목·설명·canonical이 모두 갈라진다.
// 쿼리 파라미터(?arcode=)를 쓰던 시절에는 세 값이 전 지역 동일해 구글이 전부 /daycares 하나로
// 합쳐버렸고, 250여 개 지역 페이지가 통째로 색인에서 빠져 있었다.
type RegionStrings = {
    location: string
    heading: string
    title: string
    description: string
    url: string
}

function buildSidoStrings(sido: string): RegionStrings {
    const location = getSidoShort(sido)
    const path = buildRegionPath(sido)

    return {
        location,
        heading: `${location} 어린이집`,
        title: `${location} 어린이집 | 시군구별 목록 - 키즐리`,
        description: `${location}의 시·군·구를 선택해 어린이집 목록을 확인하세요. 국공립·민간·가정 유형과 연령·지원서비스로 걸러 비교할 수 있습니다.`,
        url: `${BASE_URL}${path}`,
    }
}

function buildSigunguStrings(entry: SigunguEntry): RegionStrings {
    // 세종처럼 시도와 시군구 이름이 같은 경우 formatLocation이 중복을 걷어낸다
    const location = formatLocation(entry.sido, entry.sigungu)
    const path = buildRegionPath(entry.sido, entry.sigungu)

    return {
        location,
        heading: `${location} 어린이집`,
        title: `${location} 어린이집 | 국공립·민간·가정 목록 - 키즐리`,
        description: `${location}에 있는 어린이집을 유형·연령·지원서비스로 걸러 확인하세요. 정원과 현원, 주소까지 한 화면에서 비교할 수 있습니다.`,
        url: `${BASE_URL}${path}`,
    }
}

function buildRegionStrings(selection: RegionSelection): RegionStrings | null {
    if (selection.kind === 'sido') return buildSidoStrings(selection.sido)
    if (selection.kind === 'sigungu') return buildSigunguStrings(selection.entry)
    return null
}

async function resolveRegion(params: Props['params']): Promise<RegionResolution> {
    const { region } = await params
    const entries = await fetchSigunguNames()
    const resolution = resolveRegionSegments(region, entries)
    // 존재하지 않는 지역 경로는 라우팅 단계에서 404 — soft 200과 중복 색인 방지
    if (!resolution) notFound()
    return resolution
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { selection } = await resolveRegion(params)
    // 유형·연령·지원서비스 필터는 같은 지역 목록의 부분집합이라 canonical에 싣지 않는다 —
    // 실으면 필터 조합만큼 URL이 늘어 색인이 잘게 쪼개진다
    const region = buildRegionStrings(selection)
    const { title, description, url } = region ?? {
        title: TITLE,
        description: DESCRIPTION,
        url: `${BASE_URL}/daycares`,
    }

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

// 지역은 경로 세그먼트로 들어온다. searchParams에는 필터(type/vehicle/services/age)와,
// 경로형 이전 전에 쓰던 탭·지역 파라미터(tab/sido/arcode)만 남는다.
type Props = {
    params: Promise<{ region?: string[] }>
    searchParams: Promise<
        { tab?: string; sido?: string; arcode?: string } & Record<string, string | string[] | undefined>
    >
}

/**
 * 쿼리 파라미터로 탭·지역을 지정하던 옛 URL을 경로형으로 넘길 목적지를 만든다.
 * 색인·외부 링크에 이미 퍼져 있는 주소라 영구(308) 이전이 필요하다.
 * 폐지된 코드처럼 대조되지 않는 값은 목록 첫 화면으로 보낸다 — 목적지에는 두 파라미터가 없어
 * 리다이렉트가 다시 걸리지 않는다.
 */
function buildLegacyRegionRedirect(
    searchParams: Record<string, string | string[] | undefined>,
    entries: SigunguEntry[],
): string | null {
    // 인허가예정은 지역과 무관한 전국 화면이라 필터도 지역도 싣지 않는다
    if (searchParams.tab === 'upcoming') return '/daycares/upcoming'

    const arcode = typeof searchParams.arcode === 'string' ? searchParams.arcode : undefined
    const sido = typeof searchParams.sido === 'string' ? searchParams.sido : undefined
    if (!arcode && !sido) return null

    if (arcode) {
        const entry = entries.find((candidate) => candidate.arcode === arcode)
        const path = entry ? buildRegionPath(entry.sido, entry.sigungu) : '/daycares'
        return withFilters(path, searchParams)
    }

    const known = entries.some((entry) => entry.sido === sido)
    return withFilters(known ? buildRegionPath(sido) : '/daycares', searchParams)
}

/** 리다이렉트 목적지에 필터를 다시 실어 준다 — 지역이 바뀌어도 고른 조건은 유지된다 */
function withFilters(path: string, searchParams: Record<string, string | string[] | undefined>) {
    const filters = buildFilterQuery(searchParams)
    return filters ? `${path}?${filters}` : path
}

export default async function DaycaresPage({ params, searchParams }: Props) {
    const [{ selection, redirectTo }, resolvedSearchParams, entries] = await Promise.all([
        resolveRegion(params),
        searchParams,
        fetchSigunguNames(),
    ])

    // 지역은 맞지만 표기가 표준 슬러그와 다른 경로(폐지된 /region 시절의 공백 형태 등)를
    // 표준 URL 하나로 모은다 — 같은 목록이 두 URL로 색인되는 것을 막는다
    if (redirectTo) permanentRedirect(withFilters(redirectTo, resolvedSearchParams))

    if (selection.kind === 'index') {
        const legacy = buildLegacyRegionRedirect(resolvedSearchParams, entries)
        if (legacy) permanentRedirect(legacy)
    }

    const region = buildRegionStrings(selection)
    // 시군구 페이지에서는 그 위에 시도 단계를 한 칸 끼워 넣어 3단계 경로 구조를 그대로 드러낸다
    const sidoCrumb = selection.kind === 'sigungu' ? buildSidoStrings(selection.sido) : null

    const breadcrumbLd = buildBreadcrumbJsonLd([
        { name: '키즐리', url: BASE_URL },
        { name: '어린이집 목록', url: `${BASE_URL}/daycares` },
        ...(sidoCrumb ? [{ name: sidoCrumb.heading, url: sidoCrumb.url }] : []),
        ...(region ? [{ name: region.heading, url: region.url }] : []),
    ])

    return (
        <DaycaresShell
            activeTab="region"
            heading={region ? region.heading : '어린이집 목록'}
            description={
                region
                    ? `${region.location} 지역의 국공립·민간·가정 어린이집을 한 번에 확인하세요.`
                    : '지역별로 찾아보거나, 곧 인허가될 어린이집을 미리 확인하세요.'
            }
            seo={
                <>
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
                    />
                    <div className="daum-wm-title hidden">{region ? region.title : TITLE}</div>
                    <div className="daum-wm-content hidden">
                        {region ? region.description : DESCRIPTION}
                    </div>
                </>
            }
        >
            <RegionSection
                selection={selection}
                entries={entries}
                searchParams={resolvedSearchParams}
            />
        </DaycaresShell>
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

function RegionSection({
    selection,
    entries,
    searchParams,
}: {
    selection: RegionSelection
    entries: SigunguEntry[]
    searchParams: Record<string, string | string[] | undefined>
}) {
    const sigunguBySido = groupBySido(entries)
    const selectedEntry = selection.kind === 'sigungu' ? selection.entry : null

    // 목록 조회만 <Suspense> 안에 가둔다 — 칩까지 함께 기다리면 시군구를 고를 때마다
    // 칩이 스켈레톤에 덮여 어디를 눌렀는지 보이지 않는다.
    // 필터도 함께 실어야 클라이언트 hook과 queryKey가 어긋나지 않는다 — 어긋나면 목록이
    // 떴다가 스켈레톤으로 교체된 뒤 다시 로드된다.
    const list = selectedEntry ? (
        <ErrorBoundary fallback={<RegionDaycareListError />}>
            <Suspense fallback={<RegionDaycareListSkeleton />}>
                <RegionDaycareListSSR
                    sigunguCode={selectedEntry.arcode}
                    filters={toDaycareFilterParams(loadDaycareFilters(searchParams))}
                />
            </Suspense>
        </ErrorBoundary>
    ) : null

    return (
        <SidoChipList
            sigunguBySido={sigunguBySido}
            selectedSido={selection.kind === 'index' ? null : selection.sido}
            selectedEntry={selectedEntry}
            filterQuery={buildFilterQuery(searchParams)}
            list={list}
        />
    )
}
