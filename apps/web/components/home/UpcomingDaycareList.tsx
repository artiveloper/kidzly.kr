'use client'

// 홈 "지역별 오픈 예정 어린이집" 섹션 — 서버에서 미리 가져온 지역별 목록을 칩 선택으로 전환
import { useState } from 'react'
import type { DaycareRecentItem } from '@/domain/daycare'
import SidoFilterChips, { type SidoChipItem } from '@/components/common/SidoFilterChips'
import UpcomingDaycareItem from './UpcomingDaycareItem'

type Region = {
    key: string
    label: string
    items: DaycareRecentItem[]
}

type Props = {
    regions: Region[]
}

export default function UpcomingDaycareList({ regions }: Props) {
    const [selected, setSelected] = useState(regions[0]?.key)
    const items = regions.find((r) => r.key === selected)?.items ?? []
    const chipItems: SidoChipItem[] = regions.map((r) => ({ key: r.key, label: r.label }))

    return (
        <div>
            <div className="flex flex-wrap gap-2 py-1 mb-4">
                <SidoFilterChips items={chipItems} activeKey={selected} onSelect={setSelected} />
            </div>

            {items.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">인허가 예정인 어린이집이 없습니다.</p>
            ) : (
                <ol className="space-y-2">
                    {items.map((item) => (
                        <li key={item.id}>
                            <UpcomingDaycareItem item={item} />
                        </li>
                    ))}
                </ol>
            )}
        </div>
    )
}
