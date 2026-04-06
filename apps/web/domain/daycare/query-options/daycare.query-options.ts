import { daycareQueryKeys } from '../query-keys/daycare.query-keys'
import { fetchDaycaresInBounds } from '../apis/daycare.api'
import type { MapBounds } from '../types'

export const daycareQueryOptions = {
    bounds: (params: { bounds: MapBounds; query?: string }) => ({
        queryKey: daycareQueryKeys.bounds(params),
        queryFn: () => fetchDaycaresInBounds(params.bounds, { query: params.query }),
        staleTime: 30 * 1000,
        placeholderData: (prev: unknown) => prev,
    }),
}
