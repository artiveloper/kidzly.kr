import { parseNaverBlogPage } from '../parser/naver-blog.parser';
import type { NaverBlogPage, NaverBlogRawResponse, NaverBlogTarget } from '../types';

export async function fetchNaverBlogPage(target: NaverBlogTarget, start = 1, display = 5): Promise<NaverBlogPage> {
    const params = new URLSearchParams({
        name: target.name,
        address: target.address,
        start: String(start),
        display: String(display),
    });
    if (target.sigunguName) params.set('sigungu', target.sigunguName);

    const res = await fetch(`/api/naver/blog?${params}`);
    if (!res.ok) throw new Error('Failed to fetch naver blog');
    const data: NaverBlogRawResponse = await res.json();
    return parseNaverBlogPage(data);
}
