'use client'

import { useQuery } from '@tanstack/react-query'
import { daycareQueryOptions } from '../query-options/daycare.query-options'
import type { MapBounds } from '../types'

export function useDaycaresInBounds(
    bounds: MapBounds,
    params: { query?: string; vehicleOperation?: boolean; services?: string[]; ages?: number[] } = {}
) {
    return useQuery(daycareQueryOptions.bounds({ bounds, ...params }))
}

export function useDaycareDetail(id: string) {
    return useQuery(daycareQueryOptions.detail(id))
}

export function useDaycareTypeNames() {
    return useQuery(daycareQueryOptions.typeNames())
}

export function useDaycareServiceTypes() {
    return useQuery(daycareQueryOptions.serviceTypes())
}
