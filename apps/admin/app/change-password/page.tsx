// 최초 로그인 강제 비밀번호 변경 화면 — 대시보드 셸 밖에 두어 변경 전에는 다른 메뉴로 못 가게 한다
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { createAdminServerClient } from '@/lib/supabase/server'
import { isAdminUser, mustChangePassword } from '@/lib/auth/admin-role'
import ForcedPasswordChange from '@/components/account/ForcedPasswordChange'
import SignOutButton from '@/components/sign-out-button'

export const metadata: Metadata = {
    title: '비밀번호 변경',
}

export default async function ChangePasswordPage() {
    const supabase = await createAdminServerClient()
    const { data } = await supabase.auth.getUser()

    if (!isAdminUser(data.user)) redirect('/login?error=forbidden')
    if (!mustChangePassword(data.user)) redirect('/')

    return (
        <main className="flex min-h-dvh items-center justify-center px-4 py-10">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>비밀번호를 변경하세요</CardTitle>
                    <CardDescription>
                        초기 비밀번호로 로그인했습니다. 계속하려면 새 비밀번호를 설정해야 합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ForcedPasswordChange />
                    <div className="flex justify-center">
                        <SignOutButton />
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
