import { isServer } from '@tanstack/react-query';
import { createServerClient, createCachedServerClient } from '@workspace/supabase/server';
import { createBrowserClient } from '@workspace/supabase/client';
import { toDaycareListItem, toDaycareDetail, toDaycareRankingItem, toDaycareRecentItem, toDaycareCapacityItem, toDaycareNearbyItem, toDaycareRegionListItem } from '../parser/daycare.parser';
import type { DaycareRankingRow, DaycareNearbyRow, DaycareRegionRow } from '../parser/daycare.parser';
import type { DaycareListItem, DaycareDetail, DaycareRankingItem, DaycareRecentItem, DaycareCapacityItem, DaycareNearbyItem, DaycareRegionListResult, MapBounds } from '../types';
import { DEFAULT_REGION_LIST_LIMIT } from '../types';
import type { DaycareRow, SigunguRow, DaycareTypeNameRow, DaycareServiceTypeRow, DaycareIdRow } from '@workspace/supabase/types';

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

/**
 * 주변 어린이집 후보 풀의 캐시 수명(초).
 * 어린이집 데이터는 하루 한 번 동기화되므로 1시간 재사용해도 신선도 문제가 없다.
 */
const NEARBY_POOL_REVALIDATE_SECONDS = 3600;

const REGION_LIST_COLUMNS = 'daycare_code, name, type_name, address';

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
            .neq('latitude', '')
            .neq('longitude', '')
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

/** daycare_code에 해당하는 행이 없는 경우 — 조회 자체가 실패한 경우(일시 장애)와 구분해 404 처리에만 쓴다 */
export class DaycareNotFoundError extends Error {
    constructor(id: string) {
        super(`daycare not found: ${id}`);
        this.name = 'DaycareNotFoundError';
    }
}

export async function fetchDaycareDetail(id: string): Promise<DaycareDetail> {
    const supabase = createSupabaseClient();

    // single()은 "행 없음"도 error로 돌려줘 DB 장애와 구분되지 않는다 — maybeSingle()로 나눠 받는다
    const { data, error } = await supabase
        .from('daycares')
        .select(DETAIL_COLUMNS)
        .eq('daycare_code', id)
        .maybeSingle();

    if (error) {
        console.error('[fetchDaycareDetail]', error.message);
        throw new Error(error.message);
    }

    if (!data) {
        throw new DaycareNotFoundError(id);
    }

    return toDaycareDetail(data as DaycareRow);
}

/**
 * 같은 시군구(sigungu_code) 내 다른 정상 운영 어린이집 조회 — origin 좌표 기준 가까운 순 정렬.
 * - 현재 상세페이지의 id는 제외 — 단 쿼리가 아니라 JS에서 걸러낸다(아래 캐시 설명 참고)
 * - status='정상'만 포함
 * - limit 필수 (기본 10)
 * - 필요한 컬럼만 select (daycare_code, name, type_name, address, latitude, longitude)
 * - latitude/longitude가 varchar 컬럼이라 DB에서 직접 거리 정렬 불가 →
 *   같은 시군구 후보를 NEARBY_POOL_LIMIT만큼 가져와 JS에서 haversine 거리 계산 후 정렬·slice
 * - origin이 null(현재 어린이집 좌표 결측)이면 거리 정렬 없이 DB 반환 순서 그대로 limit
 * - 후보 풀 쿼리에는 excludeId를 넣지 않는다. 넣으면 어린이집마다 URL이 달라져 캐시가 매번
 *   빗나간다. 실제로 이 쿼리 하나가 DB 전체 시간의 57%를 차지했다(2026-09-03 pg_stat_statements,
 *   39만 회 × 평균 50ms). 시군구 단위로 URL을 모아 같은 지역 상세페이지 수천 건이 응답 하나를
 *   공유하게 하고, 현재 id 제외는 JS에서 처리한다.
 */
export async function fetchDaycareNearby(
    sigunguCode: string,
    excludeId: string,
    origin: { latitude: number; longitude: number } | null,
    options: { limit?: number } = {}
): Promise<DaycareNearbyItem[]> {
    const { limit = 10 } = options;
    const supabase = isServer
        ? createCachedServerClient(NEARBY_POOL_REVALIDATE_SECONDS)
        : createBrowserClient();

    const { data, error } = await supabase
        .from('daycares')
        .select(NEARBY_COLUMNS)
        .eq('sigungu_code', sigunguCode)
        .eq('status', '정상')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(NEARBY_POOL_LIMIT);

    if (error) {
        console.error('[fetchDaycareNearby]', error.message);
        throw new Error(error.message);
    }

    const items = ((data ?? []) as DaycareNearbyRow[])
        .filter((row) => row.daycare_code !== excludeId)
        .map((row) => toDaycareNearbyItem(row, origin));

    if (!origin) {
        return items.slice(0, limit);
    }

    return items
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
        .slice(0, limit);
}

/**
 * 특정 시군구(sigungu_code) 내 정상 운영 어린이집 목록 조회.
 * - sigungu_code(= sigungus.arcode)로 필터링 — 이름 문자열 조합 대신 코드 기준 조인.
 *   daycares.sigungu_code, sigungus.arcode 모두 varchar이고 sigungu_code는 NOT NULL이라
 *   타입 캐스팅·null 체크가 필요 없다.
 * - 사각지대: daycares 60,223건 중 sigungus.arcode에 없는 sigungu_code가 3개 코드(12110/12240/12300)
 *   총 4건(0.0066%) 존재한다. 전남광주통합특별시 관련 데이터 오염으로, 무시 가능 수준이라
 *   별도 처리하지 않는다(칩 목록에 해당 시군구가 나타나지 않아 조회 자체가 도달하지 않음).
 * - 이름순 정렬, count:'exact'로 전체 건수 동시 반환
 * - limit 기본 DEFAULT_REGION_LIST_LIMIT(1000) — 실질적으로 지역 내 전체 어린이집을 반환하는
 *   안전장치용 상한. CLAUDE.md §19 "목록 조회 limit() 강제" 준수를 위해 무제한 대신 넉넉한
 *   상수를 둔 것이며, 실제 컷이 발생하는 지역은 없다(실측 최대 779건)
 */
export async function fetchDaycaresBySigungu(
    sigunguCode: string,
    options: { limit?: number; vehicleOperation?: boolean; services?: string[]; ages?: number[] } = {}
): Promise<DaycareRegionListResult> {
    const { limit = DEFAULT_REGION_LIST_LIMIT, vehicleOperation, services, ages } = options;
    const supabase = createSupabaseClient();

    let req = supabase
        .from('daycares')
        .select(REGION_LIST_COLUMNS, { count: 'exact' })
        .eq('status', '정상')
        .eq('sigungu_code', sigunguCode);

    if (vehicleOperation) {
        req = req.eq('vehicle_operation', '운영');
    }

    if (services && services.length > 0) {
        // 콤마 구분 문자열 내 부분 일치 — 선택한 서비스 모두 포함 (AND, fetchDaycaresInBounds와 동일 패턴)
        for (const s of services) {
            req = req.ilike('services', `%${s}%`);
        }
    }

    if (ages && ages.length > 0) {
        const ageFilter = ages.map((a) => `class_count_age_${a}.gt.0`).join(',');
        req = req.or(ageFilter);
    }

    const { data, error, count } = await req
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

// sido_name은 sitemap이 /rankings/[sido]의 lastmod(시도별 data_standard_date 최대값)를
// 추가 쿼리 없이 계산하기 위해 함께 받는다
export async function fetchDaycareIdsPaginated(options: { afterCode: string | null; limit: number }): Promise<{ id: string; lastModified: string | null; sidoName: string | null }[]> {
    const { afterCode, limit } = options;
    const supabase = createServerClient();

    // OFFSET 페이지네이션(range)은 offset이 커질수록(2만여 건 기준 offset 17000 지점) 앞 행을 모두
    // 스캔·폐기하느라 statement timeout이 났다. daycare_code 커서(keyset) 방식으로 바꿔 매 페이지가
    // 인덱스 seek에서 시작하게 한다. 정렬·커서 기준을 daycare_code로 일치시켜야 배치 간 중복·누락이 없다.
    let req = supabase
        .from('daycares')
        .select('daycare_code, data_standard_date, sido_name')
        .eq('status', '정상')
        .order('daycare_code', { ascending: true })
        .limit(limit);

    if (afterCode !== null) {
        req = req.gt('daycare_code', afterCode);
    }

    const { data, error } = await req;

    // 빈 배열을 반환하면 호출부(sitemap)가 "마지막 페이지"로 오인해 이후 배치를 통째로 잃는다 —
    // 실제로 빌드 중 statement timeout 한 번에 URL 8,500여 개가 조용히 누락됐다. 반드시 throw한다.
    if (error) {
        throw new Error(`[fetchDaycareIdsPaginated] afterCode=${afterCode ?? 'START'} ${error.message}`);
    }

    return ((data ?? []) as DaycareIdRow[]).map((r) => ({
        id: r.daycare_code,
        lastModified: r.data_standard_date ?? null,
        sidoName: r.sido_name ?? null,
    }));
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

/**
 * 오픈 예정 어린이집 조회 — certified_date(인가일자)가 오늘(KST) 이후인 건을 인가일 임박 순으로 반환.
 * 공공데이터 특성상 인가일자가 미래로 등록된 경우가 있어(개원 예정), "최근 등록"과 별개로 다룬다.
 */
export async function fetchDaycareRankingUpcoming(limit = 10, sido?: string): Promise<DaycareRecentItem[]> {
    const supabase = createSupabaseClient();
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

    let req = supabase
        .from('daycares')
        .select(RANKING_COLUMNS)
        .eq('status', '정상')
        .not('certified_date', 'is', null)
        .gte('certified_date', today)
        .order('certified_date', { ascending: true });

    if (sido) req = req.eq('sido_name', sido);

    const { data, error } = await req.limit(limit);

    if (error) {
        console.error('[fetchDaycareRankingUpcoming]', error.message);
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
