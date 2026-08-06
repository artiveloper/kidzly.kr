import { cache } from 'react';
import Link from 'next/link';
import { fetchSigunguListBySido } from '@/domain/region/server';
import { buildRegionPath } from '@/domain/region';
import Breadcrumb from '@/components/common/Breadcrumb';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const BASE_URL = 'https://kidzly.kr';

// generateMetadata와 본문 간 fetch 중복 제거 — 같은 request 내 dedup
// (RegionHubPageView.getCachedRegionCount와 동일 패턴)
export const getCachedSigunguList = cache((sido: string) => fetchSigunguListBySido(sido));

type Props = {
    sido: string;
};

// /region/[sido] — 해당 시도의 시군구 전체 칩 목록. 이전 /rankings/[sido] 하단
// SigunguLinksSection의 칩 렌더링 로직을 그대로 이사(디자인 변경 없음).
export default async function RegionSidoIndexView({ sido }: Props) {
    const items = await getCachedSigunguList(sido);
    const totalCount = items.reduce((sum, item) => sum + item.count, 0);

    const pagePath = `/region/${encodeURIComponent(sido)}`;
    const pageUrl = `${BASE_URL}${pagePath}`;
    const rankingsUrl = `${BASE_URL}/rankings/${encodeURIComponent(sido)}`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${sido} 지역별 어린이집 전체 목록 | 키즐리`,
        description: `${sido} 시군구별 정상 운영 어린이집 목록 (총 ${totalCount}곳)`,
        url: pageUrl,
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.sigungu,
            url: `${BASE_URL}${buildRegionPath(sido, item.sigungu)}`,
        })),
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '키즐리', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: `${sido} 랭킹`, item: rankingsUrl },
            { '@type': 'ListItem', position: 3, name: '지역별 전체 목록', item: pageUrl },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <div className="daum-wm-title hidden">{`${sido} 어린이집 지역별 전체 목록 - 키즐리`}</div>
            <div className="daum-wm-content hidden">{`${sido} 시군구별 정상 운영 어린이집 목록을 한눈에 확인하세요.`}</div>

            <Header />

            <main className="pt-14">
                <div className="border-b border-gray-100 bg-white">
                    <div className="mx-auto max-w-2xl px-4 pt-5 pb-6">
                        <Breadcrumb
                            items={[
                                { label: '홈', href: '/' },
                                { label: `${sido} 랭킹`, href: `/rankings/${encodeURIComponent(sido)}` },
                                { label: '지역별 전체 목록' },
                            ]}
                        />
                        <h1 className="mt-3 mb-1 text-xl font-bold text-gray-900">
                            {sido} 지역별 어린이집
                        </h1>
                        <p className="text-sm text-gray-500">
                            시군구를 선택하면 해당 지역 어린이집 전체 목록을 볼 수 있어요.
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-2xl px-4 pt-6 pb-12">
                    {items.length === 0 ? (
                        <p className="py-10 text-center text-sm text-gray-500">
                            아직 등록된 시군구 정보가 없습니다.
                        </p>
                    ) : (
                        <section>
                            <h2 className="mb-3 text-sm font-bold text-gray-900">지역별 어린이집 전체 목록</h2>
                            <div className="flex flex-wrap gap-2">
                                {items.map(({ sigungu, count }) => (
                                    <Link
                                        key={sigungu}
                                        href={buildRegionPath(sido, sigungu)}
                                        className="inline-flex min-h-11 items-center rounded-full border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-400"
                                    >
                                        {sigungu}
                                        <span className="ml-1 font-normal text-gray-500">({count})</span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
