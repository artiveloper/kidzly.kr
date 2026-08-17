import { keepPreviousData } from '@tanstack/react-query'
import { daycareQueryKeys, type DaycareQueryParams, type DaycareRankingParams, type DaycareNearbyParams, type DaycareRegionListParams } from '../query-keys/daycare.query-keys'
import {
    fetchDaycaresInBounds,
    fetchDaycareDetail,
    fetchDaycareTypeNames,
    fetchDaycareServiceTypes,
    fetchDaycareRankingWaiting,
    fetchDaycareRankingCapacity,
    fetchDaycareRankingOldest,
    fetchDaycareRankingRecent,
    fetchDaycareNearby,
    fetchDaycaresBySigungu,
} from '../apis/daycare.api'
import { DEFAULT_REGION_LIST_LIMIT } from '../types'

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

    nearby: (params: DaycareNearbyParams) => ({
        queryKey: daycareQueryKeys.nearby(params),
        queryFn: () =>
            fetchDaycareNearby(
                params.sigunguCode,
                params.excludeId,
                params.latitude !== null && params.longitude !== null
                    ? { latitude: params.latitude, longitude: params.longitude }
                    : null,
                { limit: params.limit ?? 10 }
            ),
        // 정적에 가까운 데이터 — ranking* 쿼리와 동일하게 1시간 staleTime (CLAUDE.md §5: 일반 리스트는 global staleTime이 원칙이나,
        // 같은 어린이집 목록은 ranking*과 성격이 같은 준정적 리스트이므로 기존 ranking* 패턴을 그대로 따름)
        staleTime: 60 * 60 * 1000,
    }),

    regionList: (params: DaycareRegionListParams) => ({
        queryKey: daycareQueryKeys.regionList(params),
        queryFn: () => fetchDaycaresBySigungu(params.sigunguCode, {
            limit: params.limit ?? DEFAULT_REGION_LIST_LIMIT,
            vehicleOperation: params.vehicleOperation,
            services: params.services,
            ages: params.ages,
        }),
        // nearby/ranking*과 동일하게 준정적 리스트로 취급 — 1시간 staleTime
        staleTime: 60 * 60 * 1000,
    }),
}
