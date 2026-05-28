export type NaverBlogItem = {
    title: string;
    link: string;
    description: string;
    bloggerName: string;
    bloggerLink: string;
    postDate: string;
};

export type NaverBlogPage = {
    items: NaverBlogItem[];
    total: number;
    start: number;
    display: number;
};

export type NaverBlogRawItem = {
    title: string;
    link: string;
    description: string;
    bloggername: string;
    bloggerlink: string;
    postdate: string;
};

export type NaverBlogRawResponse = {
    total: number;
    start: number;
    display: number;
    items: NaverBlogRawItem[];
};
