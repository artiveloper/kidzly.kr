import { daycareQueryKeys } from '../query-keys/daycare.query-keys'
import { fetchDaycaresInBounds } from '../apis/daycare.api'
import type { MapBounds } from '../types'

export const daycareQueryOptions = {
    bounds: (bounds: MapBounds) => ({
        queryKey: daycareQueryKeys.bounds(bounds),
        queryFn: () => fetchDaycaresInBounds(bounds),
        staleTime: 30 * 1000,
    }),
}
