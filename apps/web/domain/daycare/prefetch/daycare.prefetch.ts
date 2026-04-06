import 'server-only'
import type { QueryClient } from '@tanstack/react-query'
import { daycareQueryOptions } from '../query-options/daycare.query-options'
import type { MapBounds } from '../types'

export const daycarePrefetch = {
    bounds(bounds: MapBounds) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.bounds(bounds))
        }
    },
}
