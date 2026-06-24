export default function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return <span className="text-lg font-black text-amber-500 w-8 shrink-0 text-center">{rank}</span>;
    if (rank === 2) return <span className="text-lg font-black text-gray-400 w-8 shrink-0 text-center">{rank}</span>;
    if (rank === 3) return <span className="text-lg font-black text-amber-700 w-8 shrink-0 text-center">{rank}</span>;
    return <span className="text-base font-bold text-gray-300 w-8 shrink-0 text-center">{rank}</span>;
}
