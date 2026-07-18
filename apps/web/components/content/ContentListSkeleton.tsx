function ContentCardSkeleton() {
    return (
        <li className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
            <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 sm:h-28 sm:w-28" />
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
                <div className="space-y-2">
                    <div className="h-3 w-20 rounded bg-gray-100" />
                    <div className="h-4 w-4/5 rounded bg-gray-100" />
                    <div className="h-3 w-3/5 rounded bg-gray-100" />
                </div>
                <div className="h-3 w-32 rounded bg-gray-100" />
            </div>
        </li>
    );
}

export default function ContentListSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="mb-2 flex gap-2 py-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-8 w-20 shrink-0 rounded-full bg-gray-100" />
                ))}
            </div>
            <ul className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <ContentCardSkeleton key={i} />
                ))}
            </ul>
        </div>
    );
}
