import { useInfiniteQuery } from '@tanstack/react-query';
import { naverBlogQueryKeys } from '../query-keys/naver-blog.query-keys';
import { fetchNaverBlogPage } from '../apis/naver-blog.api';

const DISPLAY = 5;

export function useNaverBlogInfinite(query: string, name: string) {
    return useInfiniteQuery({
        queryKey: naverBlogQueryKeys.search(query, name),
        queryFn: ({ pageParam }) => fetchNaverBlogPage(query, name, pageParam, DISPLAY),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const nextStart = lastPage.start + lastPage.display;
            return nextStart <= lastPage.total ? nextStart : undefined;
        },
    });
}
