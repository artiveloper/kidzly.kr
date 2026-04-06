import type { MapBounds } from '../types'

export type DaycareQueryParams = {
    bounds: MapBounds
    query?: string
    vehicleOperation?: boolean
    services?: string[]
}

export const daycareQueryKeys = {
    all: ['daycare'] as const,

    bounds: (params: DaycareQueryParams) =>
        [...daycareQueryKeys.all, 'bounds', params] as const,
}
