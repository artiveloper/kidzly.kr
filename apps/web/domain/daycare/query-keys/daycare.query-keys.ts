import type { MapBounds } from '../types'

export const daycareQueryKeys = {
    all: ['daycare'] as const,

    bounds: (bounds: MapBounds) =>
        [...daycareQueryKeys.all, 'bounds', bounds] as const,
}
