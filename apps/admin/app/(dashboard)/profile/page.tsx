// 내 프로필 화면 — 로그인 계정 정보 확인과 비밀번호 변경을 제공한다
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
import { isAdminUser } from '@/lib/auth/admin-role'
import { formatUtcDateTime } from '@/lib/format'
import PasswordChangeForm from '@/components/account/PasswordChangeForm'

export const metadata: Metadata = {
    title: '프로필',
}

export default async function ProfilePage() {
    const supabase = await createAdminServerClient()
    const { data } = await supabase.auth.getUser()

    if (!isAdminUser(data.user)) redirect('/login?error=forbidden')

    const name = typeof data.user.user_metadata?.name === 'string' ? data.user.user_metadata.name : ''
    const rows = [
        { label: '이름', value: name || '-' },
        { label: '이메일', value: data.user.email ?? '-' },
        { label: '권한', value: '관리자' },
        { label: '가입일', value: formatUtcDateTime(data.user.created_at) },
    ]

    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">프로필</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    로그인 계정 정보를 확인하고 비밀번호를 바꿀 수 있다.
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">계정 정보</CardTitle>
                        <CardDescription>이름 변경은 관리자 관리 화면에서 한다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="border-border divide-border divide-y rounded-lg border">
                            {rows.map((row) => (
                                <div
                                    key={row.label}
                                    className="grid gap-1 px-3 py-2 sm:grid-cols-[6rem_1fr] sm:gap-3"
                                >
                                    <dt className="text-muted-foreground text-sm">{row.label}</dt>
                                    <dd className="text-sm break-words">{row.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">비밀번호 변경</CardTitle>
                        <CardDescription>
                            현재 비밀번호를 확인한 뒤 새 비밀번호로 바꾼다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PasswordChangeForm />
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
