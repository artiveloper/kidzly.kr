import type { MapBounds } from '../types'

export type DaycareQueryParams = {
    bounds: MapBounds
    query?: string
    vehicleOperation?: boolean
    services?: string[]
    ages?: number[]
}

export type DaycareRankingParams = {
    limit?: number
    sido?: string
}

export type DaycareNearbyParams = {
    sigunguCode: string
    excludeId: string
    limit?: number
}

export type DaycareRegionListParams = {
    sido: string
    sigungu: string
    limit?: number
}

export const daycareQueryKeys = {
    all: ['daycare'] as const,

    bounds: (params: DaycareQueryParams) =>
        [...daycareQueryKeys.all, 'bounds', params] as const,

    detail: (id: string) =>
        [...daycareQueryKeys.all, 'detail', id] as const,

    typeNames: ['daycare', 'typeNames'] as const,

    serviceTypes: ['daycare', 'serviceTypes'] as const,

    rankingWaiting: (params: DaycareRankingParams = {}) =>
        [...daycareQueryKeys.all, 'ranking', 'waiting', params] as const,

    rankingCapacity: (params: DaycareRankingParams = {}) =>
        [...daycareQueryKeys.all, 'ranking', 'capacity', params] as const,

    rankingOldest: (params: DaycareRankingParams = {}) =>
        [...daycareQueryKeys.all, 'ranking', 'oldest', params] as const,

    rankingRecent: (params: DaycareRankingParams = {}) =>
        [...daycareQueryKeys.all, 'ranking', 'recent', params] as const,

    nearby: (params: DaycareNearbyParams) =>
        [...daycareQueryKeys.all, 'nearby', params] as const,

    regionList: (params: DaycareRegionListParams) =>
        [...daycareQueryKeys.all, 'regionList', params] as const,
}
