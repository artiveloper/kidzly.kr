// DaycareListItem과 크기를 맞춘 스켈레톤 — 목록 초기 로딩 시 CLS 방지
export default function DaycareListItemSkeleton() {
    return (
        <div className="border-b border-gray-100 px-4 py-3.5 animate-pulse">
            <div className="mb-1 flex items-center gap-2">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="h-4 w-10 rounded bg-gray-100" />
            </div>
            <div className="mb-1 flex items-center gap-1">
                <div className="h-3.5 w-48 rounded bg-gray-100" />
            </div>
            <div className="flex items-center gap-3">
                <div className="h-3.5 w-24 rounded bg-gray-100" />
                <div className="h-3.5 w-16 rounded bg-gray-100" />
            </div>
        </div>
    );
}
