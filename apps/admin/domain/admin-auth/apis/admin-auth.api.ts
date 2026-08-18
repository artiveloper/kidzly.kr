// Supabase Auth 이메일 로그인·로그아웃 호출을 담당하는 API 레이어
import { createAdminBrowserClient } from '@/lib/supabase/client';
import { isAdminUser } from '@/lib/auth/admin-role';
import type { SignInInput } from '../types';

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

export async function signOut() {
    const supabase = createAdminBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
