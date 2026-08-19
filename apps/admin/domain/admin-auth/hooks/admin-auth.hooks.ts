'use client';
// 로그인·로그아웃 뮤테이션과 이후 세션 반영을 담당하는 훅
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { changePassword, signInWithEmail, signOut } from '../apis/admin-auth.api';

export function useSignIn() {
    const router = useRouter();

    return useMutation({
        mutationFn: signInWithEmail,
        onSuccess: () => {
            router.replace('/');
            // 새 세션 쿠키로 서버 레이아웃을 다시 실행해야 한다 (CLAUDE.md 18번 인증 예외)
            router.refresh();
        },
    });
}

export function useSignOut() {
    const router = useRouter();

    return useMutation({
        mutationFn: signOut,
        onSuccess: () => {
            router.replace('/login');
            router.refresh();
        },
    });
}

export function useChangePassword() {
    const router = useRouter();

    return useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            // 변경된 사용자 메타데이터를 서버(proxy·레이아웃)가 다시 읽어야 한다 (CLAUDE.md 18번 인증 예외)
            router.refresh();
        },
    });
}
