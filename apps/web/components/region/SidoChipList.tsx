'use client'

// 시도 → 시군구 → 결과 순으로 같은 페이지 안에서 전환되는 3단계 지역 필터
// (/daycares 지역별 탭 전용, 선택 상태를 sido/sigungu 쿼리 파라미터에 동기화해
// 다른 페이지에서 특정 지역으로 바로 딥링크할 수 있게 한다)
import { Suspense } from 'react'
import { parseAsString, useQueryState } from 'nuqs'
import { cn } from '@workspace/ui/lib/utils'
import { SIDO_LIST, SIDO_SHORT, getSidoShort } from '@/domain/region'
import type { SigunguEntry } from '@/domain/region'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import SidoFilterChips, { type SidoChipItem } from '@/components/common/SidoFilterChips'
import DaycareFilters from '@/components/daycare/list/filters/DaycareFilters'
import RegionDaycareList from './RegionDaycareList'
import RegionDaycareListSkeleton from './RegionDaycareListSkeleton'
import RegionDaycareListError from './RegionDaycareListError'

type Props = {
    sigunguBySido: Record<string, SigunguEntry[]>
}

function chipClass(active: boolean) {
    return cn(
        'inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
        active
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400',
    )
}

export default function SidoChipList({ sigunguBySido }: Props) {
    const [sidoParam, setSidoParam] = useQueryState('sido', parseAsString)
    const [sigunguParam, setSigunguParam] = useQueryState('sigungu', parseAsString)

    // URL에서 들어온 값은 잘못됐거나(오타·과거 지역명 등) 낡았을 수 있어 sigunguBySido와
    // 대조해 검증 — 유효하지 않으면 무시하고 초기 화면으로 폴백
    const selectedSido = sidoParam && sigunguBySido[sidoParam] ? sidoParam : null
    const items = selectedSido ? sigunguBySido[selectedSido] ?? [] : []
    const selectedSigungu =
        selectedSido && items.some((item) => item.sigungu === sigunguParam) ? sigunguParam : null

    if (!selectedSido) {
        const sidoItems: SidoChipItem[] = SIDO_LIST.map((sido) => ({ key: sido, label: SIDO_SHORT[sido] }))
        return (
            <div className="flex flex-wrap gap-2">
                <SidoFilterChips items={sidoItems} activeKey={undefined} onSelect={setSidoParam} />
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => {
                        setSidoParam(null)
                        setSigunguParam(null)
                    }}
                    className={chipClass(false)}
                >
                    ← {getSidoShort(selectedSido)}
                </button>
                {items.map(({ sigungu }) => {
                    const active = selectedSigungu === sigungu
                    return (
                        <button
                            key={sigungu}
                            type="button"
                            onClick={() => setSigunguParam(sigungu)}
                            className={chipClass(active)}
                        >
                            {sigungu}
                        </button>
                    )
                })}
            </div>

            {selectedSigungu && (
                <div className="mt-6">
                    {/* 필터 변경으로 목록 쿼리가 다시 suspend돼도 필터 바는 계속 보이도록
                        Suspense 경계 밖(형제)에 둔다 — 안에 두면 필터 선택할 때마다 필터 바까지
                        스켈레톤으로 통째로 사라진다 */}
                    <DaycareFilters className="px-0" />
                    <ErrorBoundary fallback={<RegionDaycareListError />}>
                        <Suspense fallback={<RegionDaycareListSkeleton />}>
                            <RegionDaycareList sido={selectedSido} sigungu={selectedSigungu} />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            )}
        </div>
    )
}
