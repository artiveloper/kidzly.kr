// 관리자 로그인 화면 — 권한 없는 세션으로 진입한 경우 안내와 로그아웃을 함께 제공한다
import type { Metadata } from 'next'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import LoginForm from '@/components/login-form'
import SignOutButton from '@/components/sign-out-button'

export const metadata: Metadata = {
    title: '로그인',
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams
    const isForbidden = error === 'forbidden'

    return (
        <main className="flex min-h-dvh items-center justify-center px-4 py-10">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>키즐리 관리자</CardTitle>
                    <CardDescription>운영자 계정으로 로그인하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isForbidden ? (
                        <Alert variant="destructive">
                            <AlertTitle>접근 권한이 없습니다</AlertTitle>
                            <AlertDescription>
                                이 계정에는 관리자 권한이 없습니다. 다른 계정으로 로그인하세요.
                                <SignOutButton variant="outline" />
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    <LoginForm />
                </CardContent>
            </Card>
        </main>
    )
}
