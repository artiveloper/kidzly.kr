import Link from 'next/link';
import type { DaycareCapacityItem } from '@/domain/daycare';
import { formatLocation } from '@/domain/region';
import { TypeBadge, RankBadge } from './RankingItemShared';

type Props = {
    items: DaycareCapacityItem[];
};

export function CapacityRankingList({ items }: Props) {
    if (items.length === 0) {
        return (
            <p className="text-sm text-gray-400 text-center py-10">데이터를 불러올 수 없습니다.</p>
        );
    }

    return (
        <ol className="space-y-2">
            {items.map((item) => {
                const location = formatLocation(item.sidoName, item.sigunguName);
                const subText = [
                    item.currentChildCount !== null ? `현원 ${item.currentChildCount}` : null,
                    item.waitingChildTotal !== null && item.waitingChildTotal > 0
                        ? `대기 ${item.waitingChildTotal}명`
                        : null,
                ].filter(Boolean).join(' · ');

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
                                {subText && (
                                    <p className="text-xs text-gray-400 mt-0.5">{subText}</p>
                                )}
                            </div>

                            <div className="shrink-0 text-right">
                                <p className="text-lg font-black text-blue-600 leading-none">{item.capacity.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">명 정원</p>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ol>
    );
}
