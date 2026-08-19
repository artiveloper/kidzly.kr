// 관리자 관리 세그먼트 로딩 스켈레톤
import { Skeleton } from '@workspace/ui/components/skeleton'
import AdminUserTableSkeleton from '@/components/admin-user/AdminUserTableSkeleton'

export default function Loading() {
    return (
        <section className="space-y-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-72" />
            <AdminUserTableSkeleton />
        </section>
    )
}
