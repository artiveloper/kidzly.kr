// 관리자 계정 관리 페이지 — 계정 수가 적어 페이징 없이 전체 목록을 서버에서 미리 채운다
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { prefetchAdminUserList } from '@/domain/admin-user/server'
import { runPrefetch } from '@/lib/react-query/prefetch'
import { createAdminServerClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/auth/admin-role'
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider'
import AdminUserListView from '@/components/admin-user/AdminUserListView'

export const metadata: Metadata = {
    title: '관리자 목록',
}

export default async function AdminsPage() {
    const supabase = await createAdminServerClient()
    const { data } = await supabase.auth.getUser()
    if (!isAdminUser(data.user)) redirect('/login?error=forbidden')

    const state = await runPrefetch(prefetchAdminUserList())

    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">관리자 목록</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    등록한 계정은 모두 관리자 권한을 가진다. 최초 로그인 시 비밀번호를 변경해야 한다.
                </p>
            </div>
            <HydrationBoundary state={state}>
                <AdminUserListView currentUserId={data.user.id} />
            </HydrationBoundary>
        </section>
    )
}
