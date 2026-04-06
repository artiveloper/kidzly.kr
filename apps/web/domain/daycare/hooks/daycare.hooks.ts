'use client'

import { useQuery } from '@tanstack/react-query'
import { daycareQueryOptions } from '../query-options/daycare.query-options'
import type { MapBounds } from '../types'

export function useDaycaresInBounds(bounds: MapBounds, query?: string) {
    return useQuery(daycareQueryOptions.bounds({ bounds, query }))
}
