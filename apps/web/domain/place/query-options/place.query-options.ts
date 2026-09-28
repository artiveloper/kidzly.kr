// hook 이 쓰는 queryOptions 팩토리
import { keepPreviousData } from '@tanstack/react-query';
import { placeQueryKeys, type PlaceBoundsParams } from '../query-keys/place.query-keys';
import { fetchPlacesInBounds } from '../apis/place.api';

export const placeQueryOptions = {
    bounds: (params: PlaceBoundsParams) => ({
        queryKey: placeQueryKeys.bounds(params),
        queryFn: () => fetchPlacesInBounds(params.bounds, params.filters),
        // 어린이집·놀이시설 지도와 동일 — 팬·줌 중 화면 깜빡임을 막는다
        staleTime: 30 * 1000,
        placeholderData: keepPreviousData,
    }),
};
