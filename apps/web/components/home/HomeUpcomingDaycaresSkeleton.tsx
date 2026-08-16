// HomeUpcomingDaycares와 크기를 맞춘 스켈레톤 — 초기 로딩 시 CLS 방지
const PLACEHOLDER_COUNT = 8

export default function HomeUpcomingDaycaresSkeleton() {
    return (
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
                <li
                    key={i}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-xl border border-gray-100 bg-gray-50 animate-pulse"
                >
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="h-4 w-32 rounded bg-gray-200" />
                        <div className="h-4 w-40 rounded bg-gray-200" />
                    </div>
                    <div className="shrink-0 space-y-1.5">
                        <div className="h-2.5 w-16 rounded bg-gray-200 ml-auto" />
                        <div className="h-3.5 w-20 rounded bg-gray-200 ml-auto" />
                    </div>
                </li>
            ))}
        </ol>
    )
}
