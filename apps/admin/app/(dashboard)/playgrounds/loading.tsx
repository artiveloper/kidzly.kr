// 놀이시설 목록 세그먼트 로딩 스켈레톤
import { Skeleton } from '@workspace/ui/components/skeleton'
import PlaygroundTableSkeleton from '@/components/playground/PlaygroundTableSkeleton'

export default function Loading() {
    return (
        <section className="space-y-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-72" />
            <PlaygroundTableSkeleton />
        </section>
    )
}
