import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchSigunguDirectory } from '@/domain/region/server';
import RegionHubPageView, { getCachedRegionCount } from '@/components/region/RegionHubPageView';
import { buildRegionMetadata } from '@/components/region/region-meta';

export const revalidate = 3600;
// 화이트리스트(generateStaticParams) 외 경로는 라우팅 단계에서 404 처리 — RegionHubPageView의
// 런타임 totalCount===0 체크와 함께 이중 방어
export const dynamicParams = false;

type Props = {
    params: Promise<{ sido: string; sigungu: string }>;
};

export async function generateStaticParams() {
    const directory = await fetchSigunguDirectory();
    return directory.map(({ sido, sigungu }) => ({ sido, sigungu }));
}

// URL 세그먼트는 percent-encoded·NFD로 들어올 수 있으므로 디코드+NFC 정규화 후 사용
// (/rankings/[sido]/page.tsx의 resolveSido()와 동일 원칙 — 여기선 고정 화이트리스트가 없어
// 디코드 실패(malformed % sequence)만 방어하고, 실제 유효성은 totalCount===0 → notFound()로 판단)
function resolveSegment(raw: string): string | null {
    try {
        return decodeURIComponent(raw).normalize('NFC');
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { sido: rawSido, sigungu: rawSigungu } = await params;
    const sido = resolveSegment(rawSido);
    const sigungu = resolveSegment(rawSigungu);
    if (!sido || !sigungu) return {};

    try {
        // generateMetadata와 RegionHubPageView 본문이 같은 request 내에서 dedup되도록 캐시된 함수 사용
        const { totalCount } = await getCachedRegionCount(sido, sigungu);
        return buildRegionMetadata(sido, sigungu, totalCount);
    } catch {
        return {};
    }
}

export default async function RegionSigunguPage({ params }: Props) {
    const { sido: rawSido, sigungu: rawSigungu } = await params;
    const sido = resolveSegment(rawSido);
    const sigungu = resolveSegment(rawSigungu);
    if (!sido || !sigungu) notFound();

    return <RegionHubPageView sido={sido} sigungu={sigungu} />;
}
