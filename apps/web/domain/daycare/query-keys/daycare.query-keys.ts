import type { MapBounds } from '../types'

export const daycareQueryKeys = {
    all: ['daycare'] as const,

    bounds: (params: { bounds: MapBounds; query?: string }) =>
        [...daycareQueryKeys.all, 'bounds', params] as const,
}
