// 관리자 화면의 실제 권한 게이트 — 세션과 admin role 을 서버에서 확인한 뒤 셸을 렌더링한다
import { redirect } from 'next/navigation'
import { createAdminServerClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/auth/admin-role'
import { Separator } from '@workspace/ui/components/separator'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@workspace/ui/components/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import AdminBreadcrumb from '@/components/admin-breadcrumb'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createAdminServerClient()
    const { data } = await supabase.auth.getUser()

    if (!isAdminUser(data.user)) {
        redirect('/login?error=forbidden')
    }

    return (
        <SidebarProvider>
            <AppSidebar email={data.user.email ?? '계정 정보 없음'} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                        />
                        <AdminBreadcrumb />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}
