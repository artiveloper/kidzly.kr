import Link from 'next/link';
import type { DaycareRankingItem } from '@/domain/daycare';

const TYPE_COLORS: Record<string, string> = {
    '국공립': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '민간': 'bg-blue-50 text-blue-700 border-blue-200',
    '가정': 'bg-orange-50 text-orange-700 border-orange-200',
    '법인': 'bg-purple-50 text-purple-700 border-purple-200',
    '직장': 'bg-teal-50 text-teal-700 border-teal-200',
};

function TypeBadge({ typeName }: { typeName: string }) {
    const key = Object.keys(TYPE_COLORS).find((k) => typeName.includes(k)) ?? '';
    const colorClass = TYPE_COLORS[key] ?? 'bg-gray-50 text-gray-600 border-gray-200';
    return (
        <span className={`inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded border ${colorClass}`}>
            {typeName}
        </span>
    );
}

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return <span className="text-lg font-black text-amber-500 w-8 shrink-0 text-center">{rank}</span>;
    if (rank === 2) return <span className="text-lg font-black text-gray-400 w-8 shrink-0 text-center">{rank}</span>;
    if (rank === 3) return <span className="text-lg font-black text-amber-700 w-8 shrink-0 text-center">{rank}</span>;
    return <span className="text-base font-bold text-gray-300 w-8 shrink-0 text-center">{rank}</span>;
}

type Props = {
    items: DaycareRankingItem[];
};

export function WaitingRankingList({ items }: Props) {
    if (items.length === 0) {
        return (
            <p className="text-sm text-gray-400 text-center py-10">데이터를 불러올 수 없습니다.</p>
        );
    }

    return (
        <ol className="space-y-2">
            {items.map((item) => {
                const location = [item.sidoName, item.sigunguName].filter(Boolean).join(' ');
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
                                <p className="text-lg font-black text-red-500 leading-none">{item.waitingChildTotal.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">명 대기</p>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ol>
    );
}
