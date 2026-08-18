// daycares 도메인의 React Query 키 팩토리
import type { DaycareListParams } from '../types';

export const daycareKeys = {
    all: ['daycare'] as const,
    lists: () => [...daycareKeys.all, 'list'] as const,
    list: (params: DaycareListParams) => [...daycareKeys.lists(), params] as const,
    details: () => [...daycareKeys.all, 'detail'] as const,
    detail: (daycareCode: string) => [...daycareKeys.details(), daycareCode] as const,
};
