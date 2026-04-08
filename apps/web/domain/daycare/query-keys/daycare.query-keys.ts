import type { MapBounds } from '../types'

export type DaycareQueryParams = {
    bounds: MapBounds
    query?: string
    vehicleOperation?: boolean
    services?: string[]
    age?: number
}

export const daycareQueryKeys = {
    all: ['daycare'] as const,

    bounds: (params: DaycareQueryParams) =>
        [...daycareQueryKeys.all, 'bounds', params] as const,

    detail: (id: string) =>
        [...daycareQueryKeys.all, 'detail', id] as const,

    typeNames: ['daycare', 'typeNames'] as const,

    serviceTypes: ['daycare', 'serviceTypes'] as const,
}
