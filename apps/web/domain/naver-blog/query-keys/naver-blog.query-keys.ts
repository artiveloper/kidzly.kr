export const naverBlogQueryKeys = {
    all: ['naver-blog'] as const,
    search: (query: string, name: string) => [...naverBlogQueryKeys.all, 'search', query, name] as const,
};
