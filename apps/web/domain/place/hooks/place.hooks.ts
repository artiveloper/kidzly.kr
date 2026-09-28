'use client'

// 지도 영역 안의 놀거리를 조회하는 훅
import { useQuery } from '@tanstack/react-query';
import { placeQueryOptions } from '../query-options/place.query-options';
import type { PlaceFilters } from '../types';
import type { MapBounds } from '@/domain/daycare';

/** 지도는 로딩 중에도 그려져야 하므로 useSuspenseQuery가 아닌 useQuery를 쓴다 */
export function usePlacesInBounds(bounds: MapBounds, filters: PlaceFilters, enabled: boolean) {
    return useQuery({ ...placeQueryOptions.bounds({ bounds, filters }), enabled });
}
