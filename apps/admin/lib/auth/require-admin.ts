import 'server-only';
// Route Handler 진입점에서 호출자의 세션이 admin 인지 확인한다
import { createAdminServerClient } from '@/lib/supabase/server';
import { isAdminUser, mustChangePassword } from '@/lib/auth/admin-role';
import type { User } from '@supabase/supabase-js';

export type AdminGuardResult = { ok: true; user: User } | { ok: false; status: 401 | 403 };

export async function requireAdmin(): Promise<AdminGuardResult> {
    const supabase = await createAdminServerClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) return { ok: false, status: 401 };
    if (!isAdminUser(data.user)) return { ok: false, status: 403 };
    // 초기 비밀번호를 아직 바꾸지 않은 계정은 다른 계정을 손대지 못하게 한다
    if (mustChangePassword(data.user)) return { ok: false, status: 403 };

    return { ok: true, user: data.user };
}
