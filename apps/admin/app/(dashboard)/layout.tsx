// 관리자 화면의 실제 권한 게이트 — 세션과 admin role 을 서버에서 확인한 뒤 셸을 렌더링한다
import { redirect } from 'next/navigation'
import { createAdminServerClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/auth/admin-role'
import AdminSidebar from '@/components/admin-sidebar'
import AdminHeader from '@/components/admin-header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createAdminServerClient()
    const { data } = await supabase.auth.getUser()

    if (!isAdminUser(data.user)) {
        redirect('/login?error=forbidden')
    }

    return (
        <div className="flex min-h-dvh flex-col md:flex-row">
            <AdminSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <AdminHeader email={data.user.email ?? '계정 정보 없음'} />
                <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
            </div>
        </div>
    )
}
