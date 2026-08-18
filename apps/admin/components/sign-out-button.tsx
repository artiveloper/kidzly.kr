'use client'
// 현재 세션을 종료하고 로그인 화면으로 돌려보내는 버튼

import { Button } from '@workspace/ui/components/button'
import { useSignOut } from '@/domain/admin-auth'

export default function SignOutButton({ variant = 'ghost' }: { variant?: 'ghost' | 'outline' }) {
    const { mutate, isPending } = useSignOut()

    return (
        <Button
            type="button"
            variant={variant}
            className="h-11"
            onClick={() => mutate()}
            disabled={isPending}
        >
            로그아웃
        </Button>
    )
}
