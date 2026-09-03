// 시도 → 시군구 → 결과 순으로 전환되는 3단계 지역 필터
// (/daycares 지역별 탭 전용, 선택 상태는 경로로 표현된다 —
// /daycares → /daycares/{시도} → /daycares/{시도}/{시군구})
//
// 칩은 버튼이 아니라 링크다 — 누르면 URL이 바뀌고 제목·설명·canonical까지 다른 페이지가 된다.
// 버튼이던 시절에는 지역 페이지로 가는 <a href>가 사이트에 하나도 없어, 검색로봇이 250여 개
// 지역 목록과 그 아래 어린이집 상세로 들어갈 경로 자체가 없었다.
//
// 경로 세그먼트의 유효성 검증은 라우트(app/daycares/[[...region]]/page.tsx)가 이미 끝냈다 —
// 맞지 않는 지역은 404로 걸러지므로 여기서는 넘겨받은 선택 상태를 그대로 쓴다.
import { Suspense } from 'react'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { buildRegionPath, getSidoShort, sortSido } from '@/domain/region'
import type { SigunguEntry } from '@/domain/region'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import SidoFilterChips, { type SidoChipItem } from '@/components/common/SidoFilterChips'
import DaycareFilters from '@/components/daycare/list/filters/DaycareFilters'
import RegionDaycareList from './RegionDaycareList'
import RegionDaycareListSkeleton from './RegionDaycareListSkeleton'
import RegionDaycareListError from './RegionDaycareListError'

type Props = {
    sigunguBySido: Record<string, SigunguEntry[]>
    /** 라우트가 경로에서 해석한 시도 — 첫 화면(시도 칩)이면 null */
    selectedSido: string | null
    /** 라우트가 경로에서 해석한 시군구 — 결과 목록을 띄울 때만 채워진다 */
    selectedEntry: SigunguEntry | null
    /** 지역을 옮겨도 유지할 필터 쿼리 문자열(type/vehicle/services/age) — 지역 링크에 이어 붙인다 */
    filterQuery: string
}

function chipClass(active: boolean) {
    return cn(
        'inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
        active
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400',
    )
}

function regionHref(filterQuery: string, sido?: string, sigungu?: string) {
    const path = buildRegionPath(sido, sigungu)
    return filterQuery ? `${path}?${filterQuery}` : path
}

export default function SidoChipList({ sigunguBySido, selectedSido, selectedEntry, filterQuery }: Props) {
    if (!selectedSido) {
        // 시도 목록도 sigungus에서 온 sigunguBySido에서 파생한다 — 추가 조회 없이
        // DB를 진실 소스로 쓰고, 노출 순서만 SIDO_SHORT 키 순서(행정 순)를 따른다
        const sidoItems: SidoChipItem[] = sortSido(Object.keys(sigunguBySido)).map((name) => ({
            key: name,
            label: getSidoShort(name),
            href: regionHref(filterQuery, name),
        }))
        return (
            <div className="flex flex-wrap gap-2">
                <SidoFilterChips items={sidoItems} activeKey={undefined} />
            </div>
        )
    }

    const items = sigunguBySido[selectedSido] ?? []

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {/* 시군구 칩 목록은 결과가 떠 있는 동안에도 계속 보이므로, 이 링크는 기존과 같이
                    지역 세그먼트를 모두 비운 1단계(시도 칩) 화면으로 되돌린다 */}
                <Link href={regionHref(filterQuery)} className={chipClass(false)}>
                    ← {getSidoShort(selectedSido)}
                </Link>
                {items.map(({ sigungu, arcode: entryArcode }) => {
                    const active = selectedEntry?.arcode === entryArcode
                    return (
                        <Link
                            key={entryArcode}
                            href={regionHref(filterQuery, selectedSido, sigungu)}
                            aria-current={active ? 'page' : undefined}
                            className={chipClass(active)}
                        >
                            {sigungu}
                        </Link>
                    )
                })}
            </div>

            {selectedEntry && (
                <div className="mt-6">
                    {/* 필터 변경으로 목록 쿼리가 다시 suspend돼도 필터 바는 계속 보이도록
                        Suspense 경계 밖(형제)에 둔다 — 안에 두면 필터 선택할 때마다 필터 바까지
                        스켈레톤으로 통째로 사라진다 */}
                    <DaycareFilters className="px-0" />
                    <ErrorBoundary fallback={<RegionDaycareListError />}>
                        <Suspense fallback={<RegionDaycareListSkeleton />}>
                            <RegionDaycareList sigunguCode={selectedEntry.arcode} />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            )}
        </div>
    )
}
