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
    'daycare_code, sigungu_code, sido_name, sigungu_name, name, type_name, status, address, phone, latitude, longitude, capacity, current_child_count';

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

export async function fetchDaycaresInBounds(bounds: MapBounds, limit = 300): Promise<Daycare[]> {
    const { south, north, west, east } = bounds;
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('daycares')
        .select(DAYCARE_COLUMNS)
        .eq('status', '정상')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .filter('latitude::float8', 'gte', south)
        .filter('latitude::float8', 'lte', north)
        .filter('longitude::float8', 'gte', west)
        .filter('longitude::float8', 'lte', east)
        .limit(limit);

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
