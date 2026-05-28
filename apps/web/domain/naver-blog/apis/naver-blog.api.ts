import { parseNaverBlogPage } from '../parser/naver-blog.parser';
import type { NaverBlogPage, NaverBlogRawResponse } from '../types';

export async function fetchNaverBlogPage(query: string, start = 1, display = 5): Promise<NaverBlogPage> {
    const res = await fetch(`/api/naver/blog?query=${encodeURIComponent(query)}&start=${start}&display=${display}`);
    if (!res.ok) throw new Error('Failed to fetch naver blog');
    const data: NaverBlogRawResponse = await res.json();
    return parseNaverBlogPage(data);
}
