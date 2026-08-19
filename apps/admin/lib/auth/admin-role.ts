// Supabase 사용자의 app_metadata.role 로 admin 권한 여부를, user_metadata 로 비밀번호 변경 필요 여부를 판정한다
import type { User } from '@supabase/supabase-js';

const ADMIN_ROLE = 'admin';

export function isAdminUser(user: User | null): user is User {
    if (!user) return false;
    const role: unknown = user.app_metadata?.role;
    return role === ADMIN_ROLE;
}

/** 관리자가 만들어 준 초기 비밀번호를 아직 바꾸지 않은 계정인지 */
export function mustChangePassword(user: User | null): boolean {
    return user?.user_metadata?.must_change_password === true;
}
