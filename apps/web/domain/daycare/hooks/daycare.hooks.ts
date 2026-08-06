'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { daycareQueryOptions } from '../query-options/daycare.query-options'
import type { MapBounds } from '../types'
import type { DaycareRankingParams, DaycareNearbyParams } from '../query-keys/daycare.query-keys'

export function useDaycaresInBounds(
    bounds: MapBounds,
    params: { query?: string; vehicleOperation?: boolean; services?: string[]; ages?: number[] } = {}
) {
    return useQuery(daycareQueryOptions.bounds({ bounds, ...params }))
}

export function useDaycareDetail(id: string) {
    return useSuspenseQuery(daycareQueryOptions.detail(id))
}

export function useDaycareTypeNames() {
    return useSuspenseQuery(daycareQueryOptions.typeNames())
}

export function useDaycareServiceTypes() {
    return useSuspenseQuery(daycareQueryOptions.serviceTypes())
}

export function useDaycareRankingWaiting(params: DaycareRankingParams = {}) {
    return useSuspenseQuery(daycareQueryOptions.rankingWaiting(params))
}

export function useDaycareRankingCapacity(params: DaycareRankingParams = {}) {
    return useSuspenseQuery(daycareQueryOptions.rankingCapacity(params))
}

export function useDaycareRankingOldest(params: DaycareRankingParams = {}) {
    return useSuspenseQuery(daycareQueryOptions.rankingOldest(params))
}

export function useDaycareRankingRecent(params: DaycareRankingParams = {}) {
    return useSuspenseQuery(daycareQueryOptions.rankingRecent(params))
}

export function useDaycareNearby(params: DaycareNearbyParams) {
    return useSuspenseQuery(daycareQueryOptions.nearby(params))
}
