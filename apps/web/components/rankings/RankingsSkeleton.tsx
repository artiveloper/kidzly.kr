function RankingItemSkeleton() {
    return (
        <li className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100 bg-white">
            <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-1.5">
                    <div className="w-12 h-4 rounded-full bg-gray-100" />
                    <div className="w-16 h-3 rounded bg-gray-100" />
                </div>
                <div className="w-3/5 h-4 rounded bg-gray-100" />
                <div className="w-2/5 h-3 rounded bg-gray-100" />
            </div>
            <div className="shrink-0 text-right space-y-1">
                <div className="w-8 h-6 rounded bg-gray-100 ml-auto" />
                <div className="w-10 h-3 rounded bg-gray-100" />
            </div>
        </li>
    );
}

function RankingSectionSkeleton({ color }: { color: 'red' | 'blue' | 'amber' }) {
    const badgeColor = {
        red: 'bg-red-50',
        blue: 'bg-blue-50',
        amber: 'bg-amber-50',
    }[color];

    return (
        <section className="scroll-mt-16">
            <div className="mb-4">
                <div className={`inline-flex w-16 h-6 rounded-full ${badgeColor} mb-3`} />
                <div className="w-48 h-6 rounded bg-gray-100 mb-2" />
                <div className="w-56 h-3 rounded bg-gray-100" />
            </div>
            <ol className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                    <RankingItemSkeleton key={i} />
                ))}
            </ol>
        </section>
    );
}

export function RankingsListsSkeleton() {
    return (
        <div className="space-y-10 animate-pulse">
            <RankingSectionSkeleton color="red" />
            <RankingSectionSkeleton color="blue" />
            <RankingSectionSkeleton color="amber" />
        </div>
    );
}

export default function RankingsSkeleton() {
    return (
        <div className="max-w-lg mx-auto px-4 pb-12 space-y-10 pt-6 animate-pulse">
            {/* SidoFilter skeleton */}
            <div className="flex gap-2 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-14 h-8 rounded-full bg-gray-100 shrink-0" />
                ))}
            </div>

            <RankingSectionSkeleton color="red" />
            <RankingSectionSkeleton color="blue" />
            <RankingSectionSkeleton color="amber" />
        </div>
    );
}
