import Link from 'next/link';
import type { DaycareRecentItem } from '@/domain/daycare';
import { formatLocation } from '@/domain/region';
import { formatDate } from '@/lib/format';
import { TypeBadge, RankBadge } from './RankingItemShared';

type Props = {
    items: DaycareRecentItem[];
};

export function RecentRankingList({ items }: Props) {
    if (items.length === 0) {
        return (
            <p className="text-sm text-gray-400 text-center py-10">데이터를 불러올 수 없습니다.</p>
        );
    }

    return (
        <ol className="space-y-2">
            {items.map((item) => {
                const location = formatLocation(item.sidoName, item.sigunguName);
                const occupancyText =
                    item.capacity !== null && item.currentChildCount !== null
                        ? `정원 ${item.capacity} · 현원 ${item.currentChildCount}`
                        : item.capacity !== null
                            ? `정원 ${item.capacity}`
                            : null;

                return (
                    <li key={item.id}>
                        <Link
                            href={`/daycare/${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm active:bg-gray-50 transition-all"
                        >
                            <RankBadge rank={item.rank} />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <TypeBadge typeName={item.typeName} />
                                    {location && (
                                        <span className="text-[11px] text-gray-400 truncate">{location}</span>
                                    )}
                                </div>
                                <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                {occupancyText && (
                                    <p className="text-xs text-gray-400 mt-0.5">{occupancyText}</p>
                                )}
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-sm font-bold text-gray-800 leading-none">{formatDate(item.certifiedDate)}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">인가일</p>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ol>
    );
}
