// playgrounds 도메인의 React Query 키 팩토리
import type { PlaygroundListParams } from '../types';

export const playgroundKeys = {
    all: ['playground'] as const,
    lists: () => [...playgroundKeys.all, 'list'] as const,
    list: (params: PlaygroundListParams) => [...playgroundKeys.lists(), params] as const,
};
