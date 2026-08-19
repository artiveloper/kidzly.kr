// 관리자 계정 목록 로딩 자리표시자 — 표와 같은 행 높이를 유지해 레이아웃 이동을 막는다
import { Skeleton } from '@workspace/ui/components/skeleton'

const ROWS = Array.from({ length: 5 }, (_, index) => index)

export default function AdminUserTableSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            {ROWS.map((row) => (
                <Skeleton key={row} className="h-12 w-full" />
            ))}
        </div>
    )
}
