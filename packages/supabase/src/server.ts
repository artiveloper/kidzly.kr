import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function readEnv() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars are not set');
    return { url, key };
}

export function createServerClient() {
    const { url, key } = readEnv();
    return createClient<Database>(url, key);
}

// RequestInit.next는 next 패키지가 전역으로 증강하는 타입이다. 이 패키지는 next에 의존하지
// 않으므로 필요한 필드만 직접 선언한다.
type CachedRequestInit = RequestInit & { next?: { revalidate?: number } };

/**
 * 하루 한 번 동기화되는 준정적 조회 전용 서버 클라이언트.
 * PostgREST select는 GET이라 Next.js Data Cache에 실린다. 같은 URL의 응답을
 * revalidateSeconds 동안 재사용해, 상세페이지가 반복 렌더돼도 DB를 다시 치지 않는다.
 * 요청마다 결과가 달라야 하는 조회에는 쓰지 않는다.
 */
export function createCachedServerClient(revalidateSeconds: number) {
    const { url, key } = readEnv();
    return createClient<Database>(url, key, {
        global: {
            fetch: (input, init) =>
                fetch(input, { ...init, next: { revalidate: revalidateSeconds } } as CachedRequestInit),
        },
    });
}
