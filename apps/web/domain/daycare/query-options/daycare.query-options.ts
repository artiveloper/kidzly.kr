import { keepPreviousData } from '@tanstack/react-query'
import { daycareQueryKeys, type DaycareQueryParams, type DaycareRankingParams } from '../query-keys/daycare.query-keys'
import {
    fetchDaycaresInBounds,
    fetchDaycareDetail,
    fetchDaycareTypeNames,
    fetchDaycareServiceTypes,
    fetchDaycareRankingWaiting,
    fetchDaycareRankingCapacity,
    fetchDaycareRankingOldest,
    fetchDaycareRankingRecent,
} from '../apis/daycare.api'

export const daycareQueryOptions = {
    bounds: (params: DaycareQueryParams) => ({
        queryKey: daycareQueryKeys.bounds(params),
        queryFn: () => fetchDaycaresInBounds(params.bounds, {
            query: params.query,
            vehicleOperation: params.vehicleOperation,
            services: params.services,
            ages: params.ages,
        }),
        staleTime: 30 * 1000,
        placeholderData: keepPreviousData,
    }),

    detail: (id: string) => ({
        queryKey: daycareQueryKeys.detail(id),
        queryFn: () => fetchDaycareDetail(id),
        staleTime: 5 * 60 * 1000,
    }),

    typeNames: () => ({
        queryKey: daycareQueryKeys.typeNames,
        queryFn: fetchDaycareTypeNames,
        staleTime: Infinity,
        gcTime: Infinity,
    }),

    serviceTypes: () => ({
        queryKey: daycareQueryKeys.serviceTypes,
        queryFn: fetchDaycareServiceTypes,
        staleTime: Infinity,
        gcTime: Infinity,
    }),

    rankingWaiting: (params: DaycareRankingParams = {}) => ({
        queryKey: daycareQueryKeys.rankingWaiting(params),
        queryFn: () => fetchDaycareRankingWaiting(params.limit ?? 10, params.sido),
        staleTime: 60 * 60 * 1000,
    }),

    rankingCapacity: (params: DaycareRankingParams = {}) => ({
        queryKey: daycareQueryKeys.rankingCapacity(params),
        queryFn: () => fetchDaycareRankingCapacity(params.limit ?? 10, params.sido),
        staleTime: 60 * 60 * 1000,
    }),

    rankingOldest: (params: DaycareRankingParams = {}) => ({
        queryKey: daycareQueryKeys.rankingOldest(params),
        queryFn: () => fetchDaycareRankingOldest(params.limit ?? 10, params.sido),
        staleTime: 60 * 60 * 1000,
    }),

    rankingRecent: (params: DaycareRankingParams = {}) => ({
        queryKey: daycareQueryKeys.rankingRecent(params),
        queryFn: () => fetchDaycareRankingRecent(params.limit ?? 10, params.sido),
        staleTime: 60 * 60 * 1000,
    }),
}
