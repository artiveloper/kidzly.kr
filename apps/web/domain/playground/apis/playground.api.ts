// playgrounds 테이블 조회를 담당하는 Supabase 쿼리 레이어 (읽기 전용 — 동기화 배치가 쓰기를 소유한다)
import { isServer } from '@tanstack/react-query';
import { createServerClient } from '@workspace/supabase/server';
import { createBrowserClient } from '@workspace/supabase/client';
import { toPlaygroundMapItem, type PlaygroundMapRow } from '../parser/playground.parser';
import type { PlaygroundMapItem } from '../types';
import { PLAYGROUND_BOUNDS_LIMIT, PLAYGROUND_OPERATING_CODE } from '../types';
import type { MapBounds } from '@/domain/daycare';

function createSupabaseClient() {
    return isServer ? createServerClient() : createBrowserClient();
}

const MAP_COLUMNS = 'facility_id, name, address, latitude, longitude, indoor_outdoor_code, install_place_code';

/**
 * 지도 영역 안의 놀이시설을 조회한다.
 * daycares와 달리 latitude/longitude가 double precision이라 캐스팅 없이 비교하며 bbox 인덱스를 탄다.
 */
export async function fetchPlaygroundsInBounds(
    bounds: MapBounds,
    options: { limit?: number } = {}
): Promise<PlaygroundMapItem[]> {
    const { limit = PLAYGROUND_BOUNDS_LIMIT } = options;
    const { south, north, west, east } = bounds;
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('playgrounds')
        .select(MAP_COLUMNS)
        .eq('operation_code', PLAYGROUND_OPERATING_CODE)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', south)
        .lte('latitude', north)
        .gte('longitude', west)
        .lte('longitude', east)
        // limit으로 잘릴 때 어느 행이 남는지 결정적이도록 정렬한다
        .order('facility_id', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('[fetchPlaygroundsInBounds]', error.message);
        return [];
    }

    return (data ?? [])
        .map((row) => toPlaygroundMapItem(row as PlaygroundMapRow))
        .filter((item): item is PlaygroundMapItem => item !== null);
}
