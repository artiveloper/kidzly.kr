// 놀거리 목록 queryOptions 팩토리 — 훅과 prefetch 가 같은 queryKey 를 쓰도록 한다
import { queryOptions } from '@tanstack/react-query';
import { fetchPlaces } from '../apis/place.api';
import { placeKeys } from '../query-keys/place.query-keys';
import type { PlaceListParams } from '../types';

export function placeListOptions(params: PlaceListParams) {
    return queryOptions({
        queryKey: placeKeys.list(params),
        queryFn: () => fetchPlaces(params),
    });
}
