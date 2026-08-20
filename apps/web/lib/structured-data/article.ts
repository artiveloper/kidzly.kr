// 블로그 아티클(콘텐츠) 상세 페이지의 Article JSON-LD 빌더
export type ArticleJsonLdInput = {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    updatedAt?: string;
    thumbnail?: string;
};

const BASE_URL = 'https://kidzly.kr';

// 저자·발행 주체의 배경을 밝히는 페이지. 구글은 "누가 썼는지를 자명하게" 만들 것을 요구하고,
// 보육료·급여·감염병 기준처럼 YMYL에 해당하는 주제일수록 신뢰 신호의 비중이 커진다.
const EDITORIAL_POLICY_URL = `${BASE_URL}/about/editorial`;

export function buildArticleJsonLd(input: ArticleJsonLdInput) {
    const { title, description, url, publishedAt, updatedAt, thumbnail } = input;

    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        url,
        datePublished: publishedAt,
        dateModified: updatedAt ?? publishedAt,
        author: {
            '@type': 'Organization',
            name: '키즐리 편집팀',
            url: EDITORIAL_POLICY_URL,
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
        publishingPrinciples: EDITORIAL_POLICY_URL,
        ...(thumbnail ? { image: [thumbnail] } : {}),
    };
}
