// Supabase 사용자의 app_metadata.role 로 admin 권한 여부를 판정한다
import type { User } from '@supabase/supabase-js';

const ADMIN_ROLE = 'admin';

export function isAdminUser(user: User | null): user is User {
    if (!user) return false;
    const role: unknown = user.app_metadata?.role;
    return role === ADMIN_ROLE;
}
