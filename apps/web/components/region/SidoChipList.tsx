'use client'

// 시도 → 시군구 → 결과 순으로 같은 페이지 안에서 전환되는 3단계 지역 필터
// (/daycares 지역별 탭 전용, 선택 상태를 sido/arcode 쿼리 파라미터에 동기화해
// 다른 페이지에서 특정 지역으로 바로 딥링크할 수 있게 한다)
//
// 두 파라미터는 배타적으로 쓴다 — 시군구까지 고르면 ?arcode=11680 하나로 충분하고
// (시도·시군구 이름은 sigunguBySido에서 arcode로 엔트리를 조회해 역산한다),
// 시도만 고른 상태는 arcode가 없어 ?sido=서울특별시로만 표현된다.
// arcode 앞자리를 잘라 시도를 추론하지 않는다 — 이 데이터의 코드 체계는 표준 행정코드와
// 어긋난 흔적이 있어(목포시 12110, 광주 북구 29170) 접두 파싱을 신뢰할 수 없다.
import { Suspense, useMemo } from 'react'
import { parseAsString, useQueryState } from 'nuqs'
import { cn } from '@workspace/ui/lib/utils'
import { getSidoShort, sortSido } from '@/domain/region'
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
    const [arcodeParam, setArcodeParam] = useQueryState('arcode', parseAsString)

    // URL에서 들어온 값은 잘못됐거나(오타·과거 지역명, 폐지된 코드 등) 낡았을 수 있어
    // sigunguBySido와 대조해 검증 — 유효하지 않으면 무시하고 초기 화면으로 폴백
    const selectedEntry = useMemo(() => {
        if (!arcodeParam) return null
        for (const entries of Object.values(sigunguBySido)) {
            const found = entries.find((entry) => entry.arcode === arcodeParam)
            if (found) return found
        }
        return null
    }, [sigunguBySido, arcodeParam])

    // arcode가 유효하면 그 엔트리의 시도가 곧 선택된 시도다. 없으면 sido 파라미터로 폴백
    const selectedSido = selectedEntry
        ? selectedEntry.sido
        : sidoParam && sigunguBySido[sidoParam]
          ? sidoParam
          : null
    const items = selectedSido ? sigunguBySido[selectedSido] ?? [] : []

    if (!selectedSido) {
        // 시도 목록도 sigungus에서 온 sigunguBySido에서 파생한다 — 추가 조회 없이
        // DB를 진실 소스로 쓰고, 노출 순서만 SIDO_SHORT 키 순서(행정 순)를 따른다
        const sidoItems: SidoChipItem[] = sortSido(Object.keys(sigunguBySido)).map((sido) => ({
            key: sido,
            label: getSidoShort(sido),
        }))
        return (
            <div className="flex flex-wrap gap-2">
                <SidoFilterChips
                    items={sidoItems}
                    activeKey={undefined}
                    onSelect={(sido) => {
                        // 무효한 arcode가 URL에 남아 있는 상태로 들어올 수 있어 함께 정리 —
                        // sido와 arcode는 동시에 붙지 않는다
                        setArcodeParam(null)
                        setSidoParam(sido)
                    }}
                />
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {/* 시군구 칩 목록은 결과가 떠 있는 동안에도 계속 보이므로, 이 버튼은 기존과 같이
                    두 파라미터를 모두 비워 1단계(시도 칩) 화면으로 되돌린다 */}
                <button
                    type="button"
                    onClick={() => {
                        setArcodeParam(null)
                        setSidoParam(null)
                    }}
                    className={chipClass(false)}
                >
                    ← {getSidoShort(selectedSido)}
                </button>
                {items.map(({ sigungu, arcode }) => {
                    const active = selectedEntry?.arcode === arcode
                    return (
                        <button
                            key={arcode}
                            type="button"
                            onClick={() => {
                                // arcode 하나로 시도까지 특정되므로 sido는 URL에서 제거
                                setSidoParam(null)
                                setArcodeParam(arcode)
                            }}
                            className={chipClass(active)}
                        >
                            {sigungu}
                        </button>
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
