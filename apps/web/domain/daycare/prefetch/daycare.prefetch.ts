import 'server-only'
import type { QueryClient } from '@tanstack/react-query'
import { daycareQueryOptions } from '../query-options/daycare.query-options'
import { DEFAULT_BOUNDS } from '../types'
import type { DaycareRankingParams } from '../query-keys/daycare.query-keys'

export const daycarePrefetch = {
    bounds(params: Parameters<typeof daycareQueryOptions.bounds>[0] = { bounds: DEFAULT_BOUNDS }) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.bounds(params))
        }
    },

    detail(id: string) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.detail(id))
        }
    },

    typeNames() {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.typeNames())
        }
    },

    serviceTypes() {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.serviceTypes())
        }
    },

    rankingWaiting(params: DaycareRankingParams = {}) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.rankingWaiting(params))
        }
    },

    rankingCapacity(params: DaycareRankingParams = {}) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.rankingCapacity(params))
        }
    },

    rankingOldest(params: DaycareRankingParams = {}) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.rankingOldest(params))
        }
    },

    rankingRecent(params: DaycareRankingParams = {}) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.rankingRecent(params))
        }
    },
}
