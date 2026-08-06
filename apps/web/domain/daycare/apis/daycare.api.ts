import { isServer } from '@tanstack/react-query';
import { createServerClient } from '@/lib/supabase/server';
import { createBrowserClient } from '@/lib/supabase/client';
import { toDaycareListItem, toDaycareDetail, toDaycareRankingItem, toDaycareRecentItem, toDaycareCapacityItem, toDaycareNearbyItem, toDaycareRegionListItem } from '../parser/daycare.parser';
import type { DaycareRankingRow, DaycareNearbyRow, DaycareRegionRow } from '../parser/daycare.parser';
import type { DaycareListItem, DaycareDetail, DaycareRankingItem, DaycareRecentItem, DaycareCapacityItem, DaycareNearbyItem, DaycareRegionListResult, MapBounds } from '../types';
import { DEFAULT_REGION_LIST_LIMIT } from '../types';
import type { DaycareRow, SigunguRow, DaycareTypeNameRow, DaycareServiceTypeRow, DaycareIdRow } from '@/lib/supabase/types';

function createSupabaseClient() {
    return isServer ? createServerClient() : createBrowserClient();
}

const LIST_COLUMNS =
    'daycare_code, name, type_name, address, latitude, longitude, capacity, current_child_count, phone, services, vehicle_operation, class_count_age_0, class_count_age_1, class_count_age_2, class_count_age_3, class_count_age_4, class_count_age_5, waiting_child_age_0, waiting_child_age_1, waiting_child_age_2, waiting_child_age_3, waiting_child_age_4, waiting_child_age_5';

const DETAIL_COLUMNS =
    'daycare_code, name, sido_name, sigungu_code, sigungu_name, type_name, status, address, phone, fax, latitude, longitude, capacity, current_child_count, nursery_room_count, nursery_room_size, playground_count, cctv_count, childcare_staff_count, class_count_age_0, class_count_age_1, class_count_age_2, class_count_age_3, class_count_age_4, class_count_age_5, class_count_infant_mixed, class_count_child_mixed, class_count_special, child_count_age_0, child_count_age_1, child_count_age_2, child_count_age_3, child_count_age_4, child_count_age_5, child_count_infant_mixed, child_count_child_mixed, child_count_special, waiting_child_age_0, waiting_child_age_1, waiting_child_age_2, waiting_child_age_3, waiting_child_age_4, waiting_child_age_5, staff_director_count, staff_teacher_count, staff_special_teacher_count, staff_therapist_count, staff_nutritionist_count, staff_nurse_count, staff_nursing_assistant_count, staff_cook_count, staff_office_count, staff_tenure_under_1y, staff_tenure_1y_to_2y, staff_tenure_2y_to_4y, staff_tenure_4y_to_6y, staff_tenure_over_6y, representative_name, certified_date, data_standard_date, synced_at, services, vehicle_operation, ai_analysis';

const NEARBY_COLUMNS = 'daycare_code, name, type_name, address, latitude, longitude';

/** origin 기준 거리순 정렬 전, 후보 풀로 가져올 최대 행 수 — latitude/longitude가 varchar라 DB 레벨 거리 정렬 불가 */
const NEARBY_POOL_LIMIT = 200;

const REGION_LIST_COLUMNS = 'daycare_code, name, type_name, address';

type DaycareRegionScanRow = Pick<DaycareRow, 'sido_name' | 'sigungu_name'>;

export async function fetchDaycares(options: { limit?: number } = {}): Promise<DaycareListItem[]> {
    const { limit = 200 } = options;
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('daycares')
        .select(LIST_COLUMNS)
        .eq('status', '정상')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(limit);

    if (error) {
        console.error('[fetchDaycares]', error.message);
        return [];
    }

    return (data ?? []).map((row) => toDaycareListItem(row as DaycareRow));
}

export async function fetchDaycaresInBounds(
    bounds: MapBounds,
    options: { query?: string; vehicleOperation?: boolean; services?: string[]; ages?: number[]; limit?: number } = {}
): Promise<DaycareListItem[]> {
    const { south, north, west, east } = bounds;
    const { query, vehicleOperation, services, ages, limit = 300 } = options;
    const supabase = createSupabaseClient();

    let req = supabase
        .from('daycares')
        .select(LIST_COLUMNS)
        .eq('status', '정상')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

    if (query) {
        req = req.or(`name.ilike.%${query}%,address.ilike.%${query}%`)
    } else {
        req = req
            .filter('latitude::float8', 'gte', south)
            .filter('latitude::float8', 'lte', north)
            .filter('longitude::float8', 'gte', west)
            .filter('longitude::float8', 'lte', east)
    }

    if (vehicleOperation) {
        req = req.eq('vehicle_operation', '운영')
    }

    if (services && services.length > 0) {
        // 콤마 구분 문자열 내 부분 일치 — 선택한 서비스 모두 포함 (AND)
        for (const s of services) {
            req = req.ilike('services', `%${s}%`)
        }
    }

    if (ages && ages.length > 0) {
        const ageFilter = ages.map((a) => `class_count_age_${a}.gt.0`).join(',');
        req = req.or(ageFilter);
    }

    const { data, error } = await req.limit(limit);

    if (error) {
        console.error('[fetchDaycaresInBounds]', error.message);
        throw new Error(error.message);
    }

    return (data ?? []).map((row) => toDaycareListItem(row as DaycareRow));
}

export async function fetchDaycareDetail(id: string): Promise<DaycareDetail> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('daycares')
        .select(DETAIL_COLUMNS)
        .eq('daycare_code', id)
        .single();

    if (error) {
        console.error('[fetchDaycareDetail]', error.message);
        throw new Error(error.message);
    }

    return toDaycareDetail(data as DaycareRow);
}

/**
 * 같은 시군구(sigungu_code) 내 다른 정상 운영 어린이집 조회 — origin 좌표 기준 가까운 순 정렬.
 * - 현재 상세페이지의 id는 제외
 * - status='정상'만 포함
 * - limit 필수 (기본 10)
 * - 필요한 컬럼만 select (daycare_code, name, type_name, address, latitude, longitude)
 * - latitude/longitude가 varchar 컬럼이라 DB에서 직접 거리 정렬 불가 →
 *   같은 시군구 후보를 NEARBY_POOL_LIMIT만큼 가져와 JS에서 haversine 거리 계산 후 정렬·slice
 * - origin이 null(현재 어린이집 좌표 결측)이면 거리 정렬 없이 DB 반환 순서 그대로 limit
 */
export async function fetchDaycareNearby(
    sigunguCode: string,
    excludeId: string,
    origin: { latitude: number; longitude: number } | null,
    options: { limit?: number } = {}
): Promise<DaycareNearbyItem[]> {
    const { limit = 10 } = options;
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('daycares')
        .select(NEARBY_COLUMNS)
        .eq('sigungu_code', sigunguCode)
        .eq('status', '정상')
        .neq('daycare_code', excludeId)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(NEARBY_POOL_LIMIT);

    if (error) {
        console.error('[fetchDaycareNearby]', error.message);
        throw new Error(error.message);
    }

    const items = (data ?? []).map((row) => toDaycareNearbyItem(row as DaycareNearbyRow, origin));

    if (!origin) {
        return items.slice(0, limit);
    }

    return items
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
        .slice(0, limit);
}

/**
 * 특정 시군구(sido_name + sigungu_name 문자열 조합) 내 정상 운영 어린이집 목록 조회.
 * - sigungu_code 대신 (sido_name, sigungu_name) 조합으로 필터링 (sigungus 참조 테이블 신뢰 불가)
 * - 이름순 정렬, count:'exact'로 전체 건수 동시 반환
 * - limit 기본 DEFAULT_REGION_LIST_LIMIT(1000) — 실질적으로 지역 내 전체 어린이집을 반환하는
 *   안전장치용 상한. CLAUDE.md §19 "목록 조회 limit() 강제" 준수를 위해 무제한 대신 넉넉한
 *   상수를 둔 것이며, 실제 컷이 발생하는 지역은 없다(실측 최대 779건)
 */
export async function fetchDaycaresBySigungu(
    sido: string,
    sigungu: string,
    options: { limit?: number } = {}
): Promise<DaycareRegionListResult> {
    const { limit = DEFAULT_REGION_LIST_LIMIT } = options;
    const supabase = createSupabaseClient();

    const { data, error, count } = await supabase
        .from('daycares')
        .select(REGION_LIST_COLUMNS, { count: 'exact' })
        .eq('status', '정상')
        .eq('sido_name', sido)
        .eq('sigungu_name', sigungu)
        .order('name', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('[fetchDaycaresBySigungu]', error.message);
        throw new Error(error.message);
    }

    return {
        items: (data ?? []).map((row) => toDaycareRegionListItem(row as DaycareRegionRow)),
        totalCount: count ?? 0,
    };
}

export async function fetchDaycareTypeNames(): Promise<string[]> {
    const supabase = createSupabaseClient();

    const result = await supabase.from('daycare_type_names').select('type_name');

    if (result.error) {
        console.error('[fetchDaycareTypeNames]', result.error.message);
        return [];
    }

    return (result.data as DaycareTypeNameRow[]).map((r) => r.type_name);
}

export async function fetchDaycareServiceTypes(): Promise<string[]> {
    const supabase = createSupabaseClient();

    const result = await supabase.from('daycare_service_types').select('service_name');

    if (result.error) {
        console.error('[fetchDaycareServiceTypes]', result.error.message);
        return [];
    }

    return (result.data as DaycareServiceTypeRow[]).map((r) => r.service_name);
}

export async function fetchDaycareCount(): Promise<number> {
    const supabase = createServerClient();

    const { count, error } = await supabase
        .from('daycares')
        .select('*', { count: 'exact', head: true })
        .eq('status', '정상');

    if (error) {
        console.error('[fetchDaycareCount]', error.message);
        return 0;
    }

    return count ?? 0;
}

export async function fetchDaycareIdsPaginated(options: { offset: number; limit: number }): Promise<{ id: string; lastModified: string | null }[]> {
    const { offset, limit } = options;
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('daycares')
        .select('daycare_code, data_standard_date')
        .eq('status', '정상')
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('[fetchDaycareIdsPaginated]', error.message);
        return [];
    }

    return ((data ?? []) as DaycareIdRow[]).map((r) => ({
        id: r.daycare_code,
        lastModified: r.data_standard_date ?? null,
    }));
}

/**
 * status='정상' 레코드의 (sido_name, sigungu_name)만 배치로 조회 — sitemap.ts의
 * fetchDaycareIdsPaginated와 동일한 배치 패턴. domain/region의 시군구 디렉토리 집계 함수가
 * 전량 스캔용으로 호출한다 (build-time/SSR 전용, React Query 미경유).
 */
export async function fetchDaycareRegionRowsPaginated(options: {
    offset: number;
    limit: number;
    sido?: string;
}): Promise<{ sido: string | null; sigungu: string | null }[]> {
    const { offset, limit, sido } = options;
    const supabase = createServerClient();

    let req = supabase
        .from('daycares')
        .select('sido_name, sigungu_name')
        .eq('status', '정상');

    if (sido) req = req.eq('sido_name', sido);

    const { data, error } = await req.range(offset, offset + limit - 1);

    if (error) {
        console.error('[fetchDaycareRegionRowsPaginated]', error.message);
        return [];
    }

    return ((data ?? []) as DaycareRegionScanRow[]).map((r) => ({ sido: r.sido_name, sigungu: r.sigungu_name }));
}

const RANKING_COLUMNS =
    'daycare_code, name, sido_name, sigungu_name, type_name, address, waiting_child_total, capacity, current_child_count, certified_date';

export async function fetchDaycareRankingWaiting(limit = 10, sido?: string): Promise<DaycareRankingItem[]> {
    const supabase = createSupabaseClient();

    let req = supabase
        .from('daycares')
        .select(RANKING_COLUMNS)
        .eq('status', '정상')
        .not('waiting_child_total', 'is', null)
        .gt('waiting_child_total', 0)
        .order('waiting_child_total', { ascending: false });

    if (sido) req = req.eq('sido_name', sido);

    const { data, error } = await req.limit(limit);

    if (error) {
        console.error('[fetchDaycareRankingWaiting]', error.message);
        throw new Error(error.message);
    }

    // Supabase JS가 string-typed select에서 열을 추론하지 못하므로 DaycareRankingRow(Pick)로 단언
    return (data ?? []).map((row, i) => toDaycareRankingItem(row as DaycareRankingRow, i + 1));
}

export async function fetchDaycareRankingRecent(limit = 10, sido?: string): Promise<DaycareRecentItem[]> {
    const supabase = createSupabaseClient();

    let req = supabase
        .from('daycares')
        .select(RANKING_COLUMNS)
        .eq('status', '정상')
        .not('certified_date', 'is', null)
        .order('certified_date', { ascending: false });

    if (sido) req = req.eq('sido_name', sido);

    const { data, error } = await req.limit(limit);

    if (error) {
        console.error('[fetchDaycareRankingRecent]', error.message);
        throw new Error(error.message);
    }

    // Supabase JS가 string-typed select에서 열을 추론하지 못하므로 DaycareRankingRow(Pick)로 단언
    return (data ?? []).map((row, i) => toDaycareRecentItem(row as DaycareRankingRow, i + 1));
}

export async function fetchDaycareRankingOldest(limit = 10, sido?: string): Promise<DaycareRecentItem[]> {
    const supabase = createSupabaseClient();

    let req = supabase
        .from('daycares')
        .select(RANKING_COLUMNS)
        .eq('status', '정상')
        .not('certified_date', 'is', null)
        .order('certified_date', { ascending: true });

    if (sido) req = req.eq('sido_name', sido);

    const { data, error } = await req.limit(limit);

    if (error) {
        console.error('[fetchDaycareRankingOldest]', error.message);
        throw new Error(error.message);
    }

    // Supabase JS가 string-typed select에서 열을 추론하지 못하므로 DaycareRankingRow(Pick)로 단언
    return (data ?? []).map((row, i) => toDaycareRecentItem(row as DaycareRankingRow, i + 1));
}

export async function fetchDaycareRankingCapacity(limit = 10, sido?: string): Promise<DaycareCapacityItem[]> {
    const supabase = createSupabaseClient();

    let req = supabase
        .from('daycares')
        .select(RANKING_COLUMNS)
        .eq('status', '정상')
        .not('capacity', 'is', null)
        .gt('capacity', 0)
        .order('capacity', { ascending: false });

    if (sido) req = req.eq('sido_name', sido);

    const { data, error } = await req.limit(limit);

    if (error) {
        console.error('[fetchDaycareRankingCapacity]', error.message);
        throw new Error(error.message);
    }

    // Supabase JS가 string-typed select에서 열을 추론하지 못하므로 DaycareRankingRow(Pick)로 단언
    return (data ?? []).map((row, i) => toDaycareCapacityItem(row as DaycareRankingRow, i + 1));
}

export async function fetchSigungus(): Promise<SigunguRow[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('sigungus')
        .select('arcode, sidoname, sigunname')
        .order('sidoname')
        .order('sigunname');

    if (error) {
        console.error('[fetchSigungus]', error.message);
        return [];
    }

    return (data ?? []) as SigunguRow[];
}
