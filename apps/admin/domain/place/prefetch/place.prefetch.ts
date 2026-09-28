import 'server-only';
// 서버에서 놀거리 목록을 미리 채운다 — HTTP 왕복 없이 service role 조회를 직접 호출한다
import type { QueryClient } from '@tanstack/react-query';
import { listPlaces } from '../apis/place.service';
import { placeListOptions } from '../query-options/place.query-options';
import type { PlaceListParams } from '../types';

export function prefetchPlaceList(params: PlaceListParams) {
    return async (queryClient: QueryClient) => {
        await queryClient.prefetchQuery({
            ...placeListOptions(params),
            queryFn: () => listPlaces(params),
        });
    };
}
