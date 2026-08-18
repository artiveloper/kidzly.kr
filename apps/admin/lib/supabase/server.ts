// Server Component·Route Handler에서 요청 쿠키로 Supabase 세션을 읽는 admin 전용 클라이언트 팩토리
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@workspace/supabase/types';

export async function createAdminServerClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars are not set');

    const cookieStore = await cookies();

    return createServerClient<Database>(url, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    for (const { name, value, options } of cookiesToSet) {
                        cookieStore.set(name, value, options);
                    }
                } catch {
                    // Server Component에서는 쿠키를 쓸 수 없다. 세션 갱신은 미들웨어가 담당한다.
                }
            },
        },
    });
}
