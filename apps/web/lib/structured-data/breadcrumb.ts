// BreadcrumbList JSON-LD 빌더 — 목록/상세 페이지에서 공통 사용
export type BreadcrumbItem = {
    name: string;
    url: string;
};

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}
