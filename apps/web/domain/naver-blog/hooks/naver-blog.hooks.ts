import { useInfiniteQuery } from '@tanstack/react-query';
import { naverBlogQueryKeys } from '../query-keys/naver-blog.query-keys';
import { fetchNaverBlogPage } from '../apis/naver-blog.api';
import type { NaverBlogTarget } from '../types';

const DISPLAY = 5;

export function useNaverBlogInfinite(target: NaverBlogTarget) {
    return useInfiniteQuery({
        queryKey: naverBlogQueryKeys.search(target),
        queryFn: ({ pageParam }) => fetchNaverBlogPage(target, pageParam, DISPLAY),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const nextStart = lastPage.start + lastPage.display;
            return nextStart <= lastPage.total ? nextStart : undefined;
        },
        // 라우트가 네이버를 5초에 끊고 502를 올리므로, 기본값 3회 재시도는 실패한 섹션을
        // 백오프까지 얹어 20초 넘게 붙잡는다. 부가 정보 섹션이라 한 번만 더 시도한다.
        retry: 1,
    });
}
