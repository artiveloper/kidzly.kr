// 지역 칩 목록이 로드되기 전 자리를 잡아 두는 스켈레톤 (시도 17개 기준)
export default function RegionSectionSkeleton() {
    return (
        <div className="flex flex-wrap gap-2 animate-pulse">
            {Array.from({ length: 17 }).map((_, i) => (
                <div key={i} className="h-10 w-16 rounded-full bg-gray-100" />
            ))}
        </div>
    );
}
