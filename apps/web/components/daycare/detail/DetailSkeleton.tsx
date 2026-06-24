function SkeletonSectionTitle() {
    return <div className="h-3.5 w-16 rounded bg-gray-200 mb-3" />;
}

function SkeletonInfoGrid({ rows }: { rows: [string, string][] }) {
    return (
        <div className="space-y-2.5">
            {rows.map(([lw, vw], i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <div className={`h-3.5 ${lw} rounded bg-gray-200`} />
                    <div className={`h-3.5 ${vw} rounded bg-gray-200`} />
                </div>
            ))}
        </div>
    );
}

export default function DetailSkeleton() {
    return (
        <div className="divide-y-6 divide-gray-100 animate-pulse">
            {/* AI 분석 */}
            <div className="px-3 py-5">
                <div className="h-4 w-16 rounded bg-gray-200 mb-3" />
                <div className="space-y-2">
                    <div className="h-3.5 w-full rounded bg-gray-100" />
                    <div className="h-3.5 w-full rounded bg-gray-100" />
                    <div className="h-3.5 w-4/5 rounded bg-gray-100" />
                </div>
            </div>

            {/* 기본 정보 */}
            <div className="px-3 py-5">
                <SkeletonSectionTitle />
                <SkeletonInfoGrid rows={[
                    ['w-8', 'w-16'],
                    ['w-14', 'w-32'],
                    ['w-8', 'w-48'],
                    ['w-8', 'w-24'],
                    ['w-12', 'w-20'],
                ]} />
            </div>

            {/* 아동 현황 */}
            <div className="px-3 py-5">
                <SkeletonSectionTitle />
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {['정원', '현원', '충원율'].map((_, i) => (
                        <div key={i} className="flex flex-col items-center justify-center rounded-lg border border-gray-100 p-3 gap-1.5">
                            <div className="h-3 w-8 rounded bg-gray-200" />
                            <div className="h-5 w-12 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    <div className="h-8 rounded bg-gray-100" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-7 rounded bg-gray-50" />
                    ))}
                </div>
            </div>

            {/* 시설 · 운영 */}
            <div className="px-3 py-5">
                <SkeletonSectionTitle />
                <SkeletonInfoGrid rows={[
                    ['w-10', 'w-12'],
                    ['w-16', 'w-20'],
                    ['w-10', 'w-8'],
                    ['w-8', 'w-8'],
                    ['w-14', 'w-16'],
                ]} />
            </div>

            {/* 교직원 */}
            <div className="px-3 py-5">
                <SkeletonSectionTitle />
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex justify-between items-baseline">
                            <div className="h-3 w-10 rounded bg-gray-200" />
                            <div className="h-3 w-6 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
                <div className="space-y-2.5">
                    <div className="h-3 w-28 rounded bg-gray-200 mb-2" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="h-3 w-14 rounded bg-gray-200 shrink-0" />
                            <div className="h-2 flex-1 rounded-full bg-gray-100" />
                            <div className="h-3 w-8 rounded bg-gray-200 shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
