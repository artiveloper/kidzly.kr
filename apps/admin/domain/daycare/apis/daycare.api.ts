// daycares 테이블 조회를 담당하는 Supabase 쿼리 레이어 (읽기 전용 — 동기화 배치가 쓰기를 소유한다)
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@workspace/supabase/types';
import { parseDaycare, parseDaycareListItem } from '../parser/daycare.parser';
import type { Daycare, DaycareListParams, DaycareListResult } from '../types';

export type AdminSupabaseClient = SupabaseClient<Database>;

export const DAYCARE_PAGE_SIZE = 20;

const LIST_COLUMNS = 'daycare_code, name, type_name, status, address';

// PostgREST 의 or() 필터는 쉼표·괄호·따옴표를 구문으로 해석한다. ilike 와일드카드와 함께 제거한다.
function sanitizeKeyword(keyword: string): string {
    return keyword.replace(/[,()"\\%_*]/g, ' ').trim();
}

export async function fetchDaycares(
    supabase: AdminSupabaseClient,
    { keyword, page }: DaycareListParams
): Promise<DaycareListResult> {
    const from = (page - 1) * DAYCARE_PAGE_SIZE;

    let query = supabase
        .from('daycares')
        .select(LIST_COLUMNS)
        // name 에는 btree 인덱스가 없어(트라이그램 GIN 뿐) 이름 정렬은 6만 행 전체 정렬이 되어
        // statement timeout 이 난다. 인덱스가 있는 PK 로 정렬한다.
        .order('daycare_code', { ascending: true })
        // 다음 페이지 유무만 알면 되므로 한 건 더 받아 본다.
        .range(from, from + DAYCARE_PAGE_SIZE);

    const safeKeyword = sanitizeKeyword(keyword);
    if (safeKeyword) {
        query = query.or(`name.ilike.%${safeKeyword}%,address.ilike.%${safeKeyword}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []).map(parseDaycareListItem);
    return {
        items: rows.slice(0, DAYCARE_PAGE_SIZE),
        hasNext: rows.length > DAYCARE_PAGE_SIZE,
    };
}

/** 상세 다이얼로그를 열 때만 호출한다 — PK 조회라 전체 컬럼을 받아도 빠르다. */
export async function fetchDaycare(
    supabase: AdminSupabaseClient,
    daycareCode: string
): Promise<Daycare> {
    const { data, error } = await supabase
        .from('daycares')
        .select('*')
        .eq('daycare_code', daycareCode)
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`어린이집을 찾을 수 없습니다: ${daycareCode}`);

    return parseDaycare(data);
}
