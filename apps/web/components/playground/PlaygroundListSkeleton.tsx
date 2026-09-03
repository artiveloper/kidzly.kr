// 놀이시설 목록 로딩 자리표시자 — 실제 항목과 같은 높이를 차지해 레이아웃 이동을 막는다
export default function PlaygroundListSkeleton() {
    return (
        <ul aria-hidden>
            {Array.from({ length: 8 }, (_, index) => (
                <li key={index} className="border-b border-gray-100 px-4 py-3">
                    <div className="h-[18px] w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="mt-1.5 h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                    <div className="mt-1.5 h-4 w-1/3 animate-pulse rounded bg-gray-100" />
                </li>
            ))}
        </ul>
    );
}
