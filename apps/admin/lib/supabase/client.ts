// 브라우저에서 쿠키 기반 Supabase 세션을 다루는 admin 전용 클라이언트 팩토리
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@workspace/supabase/types';

export function createAdminBrowserClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars are not set');
    return createBrowserClient<Database>(url, key);
}
