// 놀이시설 조회의 Query Key 팩토리
import type { MapBounds } from '@/domain/daycare';

export type PlaygroundBoundsParams = {
    bounds: MapBounds;
};

export const playgroundQueryKeys = {
    all: ['playground'] as const,

    bounds: (params: PlaygroundBoundsParams) =>
        [...playgroundQueryKeys.all, 'bounds', params] as const,
};
