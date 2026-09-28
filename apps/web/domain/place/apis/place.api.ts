// places 테이블 조회를 담당하는 Supabase 쿼리 레이어 (공개 웹은 읽기 전용 — 쓰기는 어드민이 소유한다)
import { isServer } from '@tanstack/react-query';
import { createServerClient } from '@workspace/supabase/server';
import { createBrowserClient } from '@workspace/supabase/client';
import { toPlaceMapItem } from '../parser/place.parser';
import type { PlaceFilters, PlaceMapItem } from '../types';
import { PLACE_BOUNDS_LIMIT } from '../types';
import type { MapBounds } from '@/domain/daycare';

function createSupabaseClient() {
    return isServer ? createServerClient() : createBrowserClient();
}

/**
 * 지도 영역 안의 놀거리를 조회한다.
 * is_published=false 인 초안은 RLS 정책이 걸러내지만, 인덱스를 타도록 조건도 함께 건다.
 */
export async function fetchPlacesInBounds(
    bounds: MapBounds,
    filters: PlaceFilters,
    options: { limit?: number } = {}
): Promise<PlaceMapItem[]> {
    const { limit = PLACE_BOUNDS_LIMIT } = options;
    const { south, north, west, east } = bounds;
    const supabase = createSupabaseClient();

    let query = supabase
        .from('places')
        .select('*')
        .eq('is_published', true)
        .gte('latitude', south)
        .lte('latitude', north)
        .gte('longitude', west)
        .lte('longitude', east);

    if (filters.types.length > 0) query = query.in('place_type', filters.types);
    if (filters.indoorOutdoors.length > 0) {
        query = query.in('indoor_outdoor', filters.indoorOutdoors);
    }
    // 선택한 연령대 중 하나라도 대상이면 노출한다 (교집합이 아니라 합집합)
    if (filters.ages.length > 0) query = query.overlaps('age_groups', filters.ages);
    if (filters.freeOnly) query = query.eq('is_free', true);
    // 미확인(null)은 '가능'으로 볼 수 없으므로 eq 가 자연스럽게 제외한다
    if (filters.parkingOnly) query = query.eq('has_parking', true);

    const { data, error } = await query
        // limit 으로 잘릴 때 어느 행이 남는지 결정적이도록 정렬한다
        .order('id', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('[fetchPlacesInBounds]', error.message);
        return [];
    }

    return (data ?? [])
        .map((row) => toPlaceMapItem(row))
        .filter((item): item is PlaceMapItem => item !== null);
}
