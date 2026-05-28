export const naverBlogQueryKeys = {
    all: ['naver-blog'] as const,
    search: (query: string) => [...naverBlogQueryKeys.all, 'search', query] as const,
};
