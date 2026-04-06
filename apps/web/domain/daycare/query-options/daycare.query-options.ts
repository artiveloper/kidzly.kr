import { daycareQueryKeys, type DaycareQueryParams } from '../query-keys/daycare.query-keys'
import { fetchDaycaresInBounds } from '../apis/daycare.api'

export const daycareQueryOptions = {
    bounds: (params: DaycareQueryParams) => ({
        queryKey: daycareQueryKeys.bounds(params),
        queryFn: () => fetchDaycaresInBounds(params.bounds, {
            query: params.query,
            vehicleOperation: params.vehicleOperation,
            services: params.services,
        }),
        staleTime: 30 * 1000,
        placeholderData: (prev: unknown) => prev,
    }),
}
