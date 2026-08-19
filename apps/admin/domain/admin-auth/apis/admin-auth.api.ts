// Supabase Auth 이메일 로그인·로그아웃 호출을 담당하는 API 레이어
import { createAdminBrowserClient } from '@/lib/supabase/client';
import { isAdminUser } from '@/lib/auth/admin-role';
import type { ChangePasswordInput, SignInInput } from '../types';

// 자격 증명은 맞지만 admin role 이 없는 계정을 구분하기 위한 에러
export class NotAdminError extends Error {
    constructor() {
        super('The account does not have the admin role');
        this.name = 'NotAdminError';
    }
}

export async function signInWithEmail({ email, password }: SignInInput) {
    const supabase = createAdminBrowserClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // 권한 없는 계정의 세션을 남기지 않는다. 로그인 자체를 실패로 처리한다.
    if (!isAdminUser(data.user)) {
        await supabase.auth.signOut();
        throw new NotAdminError();
    }
}

// 현재 비밀번호가 틀린 경우를 구분하기 위한 에러
export class InvalidCurrentPasswordError extends Error {
    constructor() {
        super('The current password is incorrect');
        this.name = 'InvalidCurrentPasswordError';
    }
}

export async function changePassword({ currentPassword, newPassword }: ChangePasswordInput) {
    const supabase = createAdminBrowserClient();

    const { data: current } = await supabase.auth.getUser();
    const email = current.user?.email;
    if (!email) throw new Error('No active session');

    // Supabase updateUser 는 기존 비밀번호를 검증하지 않는다. 재로그인으로 본인 확인을 대신한다.
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
    });
    if (signInError) throw new InvalidCurrentPasswordError();

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
        // 초기 비밀번호 강제 변경 플래그만 내리고 나머지 메타데이터는 유지한다
        data: { ...current.user?.user_metadata, must_change_password: false },
    });
    if (error) throw error;
}

export async function signOut() {
    const supabase = createAdminBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
