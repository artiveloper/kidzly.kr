// Supabase Auth 의 User 를 화면에서 쓰는 AdminUser 형태로 변환한다
import type { User } from '@supabase/supabase-js';
import type { AdminUser } from '../types';

function toText(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

export function parseAdminUser(user: User): AdminUser {
    return {
        id: user.id,
        email: user.email ?? '',
        name: toText(user.user_metadata?.name),
        role: toText(user.app_metadata?.role),
        mustChangePassword: user.user_metadata?.must_change_password === true,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
    };
}
