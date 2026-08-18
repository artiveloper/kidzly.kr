// 놀이시설 목록 로딩 자리표시자 — 실제 표와 같은 행 수·높이를 유지해 레이아웃 이동을 막는다
import { Skeleton } from '@workspace/ui/components/skeleton'
import { PLAYGROUND_PAGE_SIZE } from '@/domain/playground'

const ROWS = Array.from({ length: PLAYGROUND_PAGE_SIZE }, (_, index) => index)

export default function PlaygroundTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {ROWS.map((row) => (
                    <Skeleton key={row} className="h-12 w-full" />
                ))}
            </div>
            <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-11 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-11 w-20" />
            </div>
        </div>
    )
}
