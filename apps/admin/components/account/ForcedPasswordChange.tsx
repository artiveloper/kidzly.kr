'use client'
// 초기 비밀번호를 쓰는 계정의 강제 변경 화면 본문 — 변경에 성공하면 대시보드로 보낸다

import { useRouter } from 'next/navigation'
import PasswordChangeForm from '@/components/account/PasswordChangeForm'

export default function ForcedPasswordChange() {
    const router = useRouter()

    return (
        <PasswordChangeForm
            submitLabel="변경하고 시작하기"
            onSuccess={() => router.replace('/')}
        />
    )
}
