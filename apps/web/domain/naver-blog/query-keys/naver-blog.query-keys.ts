import type { NaverBlogTarget } from '../types';

export const naverBlogQueryKeys = {
    all: ['naver-blog'] as const,
    search: (target: NaverBlogTarget) =>
        [...naverBlogQueryKeys.all, 'search', target.name, target.sigunguName, target.address] as const,
};
