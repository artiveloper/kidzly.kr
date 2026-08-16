// 블로그 아티클(콘텐츠) 상세 페이지의 Article JSON-LD 빌더
export type ArticleJsonLdInput = {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    thumbnail?: string;
};

const BASE_URL = 'https://kidzly.kr';

export function buildArticleJsonLd(input: ArticleJsonLdInput) {
    const { title, description, url, publishedAt, thumbnail } = input;

    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        url,
        datePublished: publishedAt,
        dateModified: publishedAt,
        author: {
            '@type': 'Organization',
            name: '키즐리',
            url: BASE_URL,
        },
        publisher: {
            '@type': 'Organization',
            name: '키즐리',
            url: BASE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/og-image.png`,
            },
        },
        ...(thumbnail ? { image: [thumbnail] } : {}),
    };
}
