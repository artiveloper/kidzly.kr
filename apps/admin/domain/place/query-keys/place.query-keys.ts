// 놀거리 도메인의 React Query 키 팩토리
import type { PlaceListParams } from '../types';

export const placeKeys = {
    all: ['place'] as const,
    list: (params: PlaceListParams) => [...placeKeys.all, 'list', params] as const,
};
