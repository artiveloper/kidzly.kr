// 시도 → 시군구 → 결과 순으로 전환되는 3단계 지역 필터
// (/daycares 지역별 탭 전용, 선택 상태를 sido/arcode 쿼리 파라미터에 동기화해
// 다른 페이지에서 특정 지역으로 바로 딥링크할 수 있게 한다)
//
// 칩은 버튼이 아니라 링크다 — 누르면 URL이 바뀌고 제목·설명·canonical까지 다른 페이지가 된다.
// 버튼이던 시절에는 지역 페이지로 가는 <a href>가 사이트에 하나도 없어, 검색로봇이 250여 개
// 지역 목록과 그 아래 어린이집 상세로 들어갈 경로 자체가 없었다.
//
// 두 파라미터는 배타적으로 쓴다 — 시군구까지 고르면 ?arcode=11680 하나로 충분하고
// (시도·시군구 이름은 sigunguBySido에서 arcode로 엔트리를 조회해 역산한다),
// 시도만 고른 상태는 arcode가 없어 ?sido=서울특별시로만 표현된다.
// arcode 앞자리를 잘라 시도를 추론하지 않는다 — 이 데이터의 코드 체계는 표준 행정코드와
// 어긋난 흔적이 있어(목포시 12110, 광주 북구 29170) 접두 파싱을 신뢰할 수 없다.
import { Suspense } from 'react'
import Link from 'next/link'
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
    sido?: string
    arcode?: string
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

function regionHref(region: string, filterQuery: string) {
    const query = [region, filterQuery].filter(Boolean).join('&')
    return query ? `/daycares?${query}` : '/daycares'
}

export default function SidoChipList({ sigunguBySido, sido, arcode, filterQuery }: Props) {
    // URL에서 들어온 값은 잘못됐거나(오타·과거 지역명, 폐지된 코드 등) 낡았을 수 있어
    // sigunguBySido와 대조해 검증 — 유효하지 않으면 무시하고 초기 화면으로 폴백
    const selectedEntry = arcode
        ? Object.values(sigunguBySido)
              .flat()
              .find((entry) => entry.arcode === arcode) ?? null
        : null

    // arcode가 유효하면 그 엔트리의 시도가 곧 선택된 시도다. 없으면 sido 파라미터로 폴백
    const selectedSido = selectedEntry
        ? selectedEntry.sido
        : sido && sigunguBySido[sido]
          ? sido
          : null

    if (!selectedSido) {
        // 시도 목록도 sigungus에서 온 sigunguBySido에서 파생한다 — 추가 조회 없이
        // DB를 진실 소스로 쓰고, 노출 순서만 SIDO_SHORT 키 순서(행정 순)를 따른다
        const sidoItems: SidoChipItem[] = sortSido(Object.keys(sigunguBySido)).map((name) => ({
            key: name,
            label: getSidoShort(name),
            href: regionHref(`sido=${encodeURIComponent(name)}`, filterQuery),
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
                    두 파라미터를 모두 비운 1단계(시도 칩) 화면으로 되돌린다 */}
                <Link href={regionHref('', filterQuery)} className={chipClass(false)}>
                    ← {getSidoShort(selectedSido)}
                </Link>
                {items.map(({ sigungu, arcode: entryArcode }) => {
                    const active = selectedEntry?.arcode === entryArcode
                    return (
                        <Link
                            key={entryArcode}
                            // arcode 하나로 시도까지 특정되므로 sido는 URL에서 제거
                            href={regionHref(`arcode=${entryArcode}`, filterQuery)}
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
