import { keepPreviousData } from '@tanstack/react-query'
import { daycareQueryKeys, type DaycareQueryParams } from '../query-keys/daycare.query-keys'
import { fetchDaycaresInBounds, fetchDaycareDetail, fetchDaycareTypeNames, fetchDaycareServiceTypes } from '../apis/daycare.api'

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
}
