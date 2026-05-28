import type { NaverBlogItem, NaverBlogPage, NaverBlogRawItem, NaverBlogRawResponse } from '../types';

function stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '');
}

function formatPostDate(postdate: string): string {
    if (postdate.length === 8) {
        return `${postdate.slice(0, 4)}.${postdate.slice(4, 6)}.${postdate.slice(6, 8)}`;
    }
    return postdate;
}

function toNaverBlogItem(raw: NaverBlogRawItem): NaverBlogItem {
    return {
        title: stripHtml(raw.title),
        link: raw.link,
        description: stripHtml(raw.description),
        bloggerName: raw.bloggername,
        bloggerLink: raw.bloggerlink,
        postDate: formatPostDate(raw.postdate),
    };
}

export function parseNaverBlogPage(raw: NaverBlogRawResponse): NaverBlogPage {
    return {
        items: (raw.items ?? []).map(toNaverBlogItem),
        total: raw.total ?? 0,
        start: raw.start ?? 1,
        display: raw.display ?? 5,
    };
}
