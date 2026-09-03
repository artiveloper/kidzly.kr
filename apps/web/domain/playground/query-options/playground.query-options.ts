// prefetch와 hook이 공유하는 queryOptions 팩토리
import { keepPreviousData } from '@tanstack/react-query';
import { playgroundQueryKeys, type PlaygroundBoundsParams } from '../query-keys/playground.query-keys';
import { fetchPlaygroundsInBounds } from '../apis/playground.api';

export const playgroundQueryOptions = {
    bounds: (params: PlaygroundBoundsParams) => ({
        queryKey: playgroundQueryKeys.bounds(params),
        queryFn: () => fetchPlaygroundsInBounds(params.bounds),
        // 어린이집 지도와 동일 — 팬·줌 중 화면 깜빡임을 막는다
        staleTime: 30 * 1000,
        placeholderData: keepPreviousData,
    }),
};
