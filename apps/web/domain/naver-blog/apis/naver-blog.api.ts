import { parseNaverBlogPage } from '../parser/naver-blog.parser';
import type { NaverBlogPage, NaverBlogRawResponse } from '../types';

export async function fetchNaverBlogPage(query: string, name: string, start = 1, display = 5): Promise<NaverBlogPage> {
    const params = new URLSearchParams({ query, name, start: String(start), display: String(display) });
    const res = await fetch(`/api/naver/blog?${params}`);
    if (!res.ok) throw new Error('Failed to fetch naver blog');
    const data: NaverBlogRawResponse = await res.json();
    return parseNaverBlogPage(data);
}
