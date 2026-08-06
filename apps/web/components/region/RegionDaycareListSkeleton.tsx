// 최종 카드 레이아웃(rounded-lg border, TypeBadge+이름 한 줄, 주소 한 줄)과 크기를 맞춰 CLS 방지
export default function RegionDaycareListSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-2 animate-pulse sm:grid-cols-2">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="min-h-11 rounded-lg border border-gray-100 bg-white px-3 py-2.5">
                    <div className="mb-1.5 flex items-center gap-1.5">
                        <div className="h-4 w-10 rounded bg-gray-100" />
                        <div className="h-4 w-2/5 rounded bg-gray-100" />
                    </div>
                    <div className="h-3 w-4/5 rounded bg-gray-100" />
                </div>
            ))}
        </div>
    );
}
