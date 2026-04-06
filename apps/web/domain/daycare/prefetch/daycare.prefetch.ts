import 'server-only'
import type { QueryClient } from '@tanstack/react-query'
import { daycareQueryOptions } from '../query-options/daycare.query-options'
import { DEFAULT_BOUNDS } from '../types'

export const daycarePrefetch = {
    bounds(params: Parameters<typeof daycareQueryOptions.bounds>[0] = { bounds: DEFAULT_BOUNDS }) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.bounds(params))
        }
    },
}
