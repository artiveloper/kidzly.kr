'use client'

// 시도(+전국/전체) 목록을 pill 칩으로 나열하는 공용 필터 — href가 있으면 링크 이동,
// 없으면 onSelect로 상태 선택 (rankings, daycares 지역별·인허가예정 탭에서 공용)
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

export type SidoChipItem = {
    key: string
    label: string
    href?: string
}

type Props = {
    items: SidoChipItem[]
    activeKey: string | undefined
    onSelect?: (key: string) => void
}

function chipClass(active: boolean) {
    return cn(
        'inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors',
        active
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400',
    )
}

export default function SidoFilterChips({ items, activeKey, onSelect }: Props) {
    return (
        <>
            {items.map((item) => {
                const active = activeKey === item.key
                if (item.href) {
                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={chipClass(active)}
                            aria-current={active ? 'page' : undefined}
                        >
                            {item.label}
                        </Link>
                    )
                }
                return (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => onSelect?.(item.key)}
                        className={chipClass(active)}
                    >
                        {item.label}
                    </button>
                )
            })}
        </>
    )
}
