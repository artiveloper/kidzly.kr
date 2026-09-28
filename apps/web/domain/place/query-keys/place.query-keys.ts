// 놀거리 조회의 Query Key 팩토리
import type { MapBounds } from '@/domain/daycare';
import type { PlaceFilters } from '../types';

export type PlaceBoundsParams = {
    bounds: MapBounds;
    filters: PlaceFilters;
};

export const placeQueryKeys = {
    all: ['place'] as const,

    bounds: (params: PlaceBoundsParams) => [...placeQueryKeys.all, 'bounds', params] as const,
};
