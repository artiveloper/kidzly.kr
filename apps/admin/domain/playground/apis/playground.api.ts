// playgrounds 테이블 조회를 담당하는 Supabase 쿼리 레이어 (읽기 전용 — 동기화 배치가 쓰기를 소유한다)
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@workspace/supabase/types';
import { parsePlayground } from '../parser/playground.parser';
import type { PlaygroundListParams, PlaygroundListResult } from '../types';

export type AdminSupabaseClient = SupabaseClient<Database>;

export const PLAYGROUND_PAGE_SIZE = 20;

// PostgREST 의 or() 필터는 쉼표·괄호·따옴표를 구문으로 해석한다. ilike 와일드카드와 함께 제거한다.
function sanitizeKeyword(keyword: string): string {
    return keyword.replace(/[,()"\\%_*]/g, ' ').trim();
}

export async function fetchPlaygrounds(
    supabase: AdminSupabaseClient,
    { keyword, page }: PlaygroundListParams
): Promise<PlaygroundListResult> {
    const from = (page - 1) * PLAYGROUND_PAGE_SIZE;

    let query = supabase
        .from('playgrounds')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })
        .order('facility_id', { ascending: true })
        .range(from, from + PLAYGROUND_PAGE_SIZE - 1);

    const safeKeyword = sanitizeKeyword(keyword);
    if (safeKeyword) {
        query = query.or(`name.ilike.%${safeKeyword}%,address.ilike.%${safeKeyword}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
        items: (data ?? []).map(parsePlayground),
        totalCount: count ?? 0,
    };
}

