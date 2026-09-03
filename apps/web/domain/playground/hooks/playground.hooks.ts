'use client'

import { useQuery } from '@tanstack/react-query';
import { playgroundQueryOptions } from '../query-options/playground.query-options';
import type { MapBounds } from '@/domain/daycare';

/** 지도는 로딩 중에도 그려져야 하므로 useSuspenseQuery가 아닌 useQuery를 쓴다 */
export function usePlaygroundsInBounds(bounds: MapBounds, enabled: boolean) {
    return useQuery({ ...playgroundQueryOptions.bounds({ bounds }), enabled });
}
