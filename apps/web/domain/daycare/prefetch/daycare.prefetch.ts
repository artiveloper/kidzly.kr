import 'server-only'
import type { QueryClient } from '@tanstack/react-query'
import { daycareQueryOptions } from '../query-options/daycare.query-options'
import { DEFAULT_BOUNDS } from '../types'
import type { DaycareDetail } from '../types'
import type { DaycareRankingParams, DaycareNearbyParams, DaycareRegionListParams } from '../query-keys/daycare.query-keys'

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

    // 이미 조회한 상세 데이터를 재조회 없이 캐시에 시딩한다 — 상세 페이지 서버 렌더에서 cache()로
    // 한 번 가져온 행을 prefetchQuery로 또 조회하지 않도록(상세 1건당 Supabase 왕복 2회 → 1회).
    // queryKey는 queryOptions.detail과 공유하므로 클라이언트 hook의 queryKey와 항상 일치한다.
    detailSeed(id: string, data: DaycareDetail) {
        return (queryClient: QueryClient) => {
            queryClient.setQueryData(daycareQueryOptions.detail(id).queryKey, data)
            return Promise.resolve()
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

    nearby(params: DaycareNearbyParams) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.nearby(params))
        }
    },

    // /daycares/{시도}/{시군구} 진입 시 초기 페이지에서 사용 (sigunguCode = sigungus.arcode)
    regionList(params: DaycareRegionListParams) {
        return async (queryClient: QueryClient) => {
            await queryClient.prefetchQuery(daycareQueryOptions.regionList(params))
        }
    },
}
