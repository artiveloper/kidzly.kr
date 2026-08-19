import 'server-only';
// Supabase Auth Admin API(계정 생성·수정·삭제)를 호출하는 서버 전용 클라이언트 팩토리
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@workspace/supabase/types';

/**
 * secret key 를 쓰므로 절대 클라이언트 번들에 들어가면 안 된다.
 * 세션 쿠키를 읽지 않는 무상태 클라이언트라 auth 자동 갱신·영속화를 모두 끈다.
 */
export function createSupabaseAdminApiClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
    if (!secretKey) throw new Error('SUPABASE_SECRET_KEY is not set');

    return createClient<Database>(url, secretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
