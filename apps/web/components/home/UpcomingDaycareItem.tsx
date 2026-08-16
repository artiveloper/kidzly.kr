// 인허가예정 어린이집 1건 카드 — 홈 미리보기, /daycares 인허가예정 탭에서 공용
import Link from 'next/link'
import type { DaycareRecentItem } from '@/domain/daycare'
import { formatLocation } from '@/domain/region'
import { formatDate } from '@/lib/format'
import TypeBadge from '@/components/rankings/TypeBadge'

type Props = {
    item: DaycareRecentItem
}

export default function UpcomingDaycareItem({ item }: Props) {
    const location = formatLocation(item.sidoName, item.sigunguName)

    return (
        <Link
            href={`/daycare/${item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 md:p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-200 hover:shadow-sm active:bg-gray-100 transition-all"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <TypeBadge typeName={item.typeName} className="text-xs!" />
                    {location && (
                        <span className="text-sm text-gray-400 truncate">{location}</span>
                    )}
                </div>
                <p className="text-sm md:text-base font-semibold text-gray-900 truncate">
                    {item.name}
                </p>
            </div>
            <div className="shrink-0 text-right whitespace-nowrap">
                <p className="text-[11px] text-gray-400">인허가예정일</p>
                <p className="text-xs md:text-sm font-semibold text-gray-900">{formatDate(item.certifiedDate)}</p>
            </div>
        </Link>
    )
}
