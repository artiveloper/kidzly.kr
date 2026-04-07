import { isServer } from '@tanstack/react-query';
import { createServerClient } from '@/lib/supabase/server';
import { createBrowserClient } from '@/lib/supabase/client';
import { toDaycare } from '../parser/daycare.parser';
import type { Daycare, MapBounds } from '../types';
import type { SigunguRow } from '@/lib/supabase/types';

function createSupabaseClient() {
    return isServer ? createServerClient() : createBrowserClient();
}

const DAYCARE_COLUMNS =
    'daycare_code, sigungu_code, sido_name, sigungu_name, name, type_name, status, address, phone, fax, latitude, longitude, capacity, current_child_count, nursery_room_count, nursery_room_size, playground_count, cctv_count, childcare_staff_count, class_count_age_0, class_count_age_1, class_count_age_2, class_count_age_3, class_count_age_4, class_count_age_5, child_count_age_0, child_count_age_1, child_count_age_2, child_count_age_3, child_count_age_4, child_count_age_5, waiting_child_age_0, waiting_child_age_1, waiting_child_age_2, waiting_child_age_3, waiting_child_age_4, waiting_child_age_5, staff_teacher_count, staff_tenure_under_1y, staff_tenure_1y_to_2y, staff_tenure_2y_to_4y, staff_tenure_4y_to_6y, staff_tenure_over_6y, representative_name, certified_date, data_standard_date, services, vehicle_operation';

export async function fetchDaycares(options: { limit?: number } = {}): Promise<Daycare[]> {
    const { limit = 200 } = options;
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('daycares')
        .select(DAYCARE_COLUMNS)
        .eq('status', '정상')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(limit);

    if (error) {
        console.error('[fetchDaycares]', error.message);
        return [];
    }

    return (data ?? []).map(toDaycare);
}

export async function fetchDaycaresInBounds(
    bounds: MapBounds,
    options: { query?: string; vehicleOperation?: boolean; services?: string[]; age?: number; limit?: number } = {}
): Promise<Daycare[]> {
    const { south, north, west, east } = bounds;
    const { query, vehicleOperation, services, age, limit = 300 } = options;
    const supabase = createSupabaseClient();

    let req = supabase
        .from('daycares')
        .select(DAYCARE_COLUMNS)
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

    if (age !== undefined) {
        req = req.gt(`class_count_age_${age}`, 0);
    }

    const { data, error } = await req.limit(limit);

    if (error) {
        console.error('[fetchDaycaresInBounds]', error.message);
        throw new Error(error.message);
    }

    return (data ?? []).map(toDaycare);
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

    return data ?? [];
}
