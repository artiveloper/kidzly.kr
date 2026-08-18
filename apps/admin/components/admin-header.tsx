// 로그인 계정과 로그아웃 버튼을 노출하는 관리자 상단 바
import SignOutButton from '@/components/sign-out-button'

export default function AdminHeader({ email }: { email: string }) {
    return (
        <header className="border-border flex items-center justify-between gap-3 border-b px-4 py-3 md:px-6">
            <p className="text-muted-foreground truncate text-sm">{email}</p>
            <SignOutButton />
        </header>
    )
}
