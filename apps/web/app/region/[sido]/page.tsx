import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SIDO_LIST, isValidSido } from '@/domain/region';
import RegionSidoIndexView, { getCachedSigunguList } from '@/components/region/RegionSidoIndexView';
import { buildRegionSidoMetadata } from '@/components/region/region-meta';

export const revalidate = 3600;
// 알려진 17개 시도만 유효 — 그 외 경로는 라우팅 단계에서 404 처리해 중복/soft-200 방지
export const dynamicParams = false;

type Props = {
    params: Promise<{ sido: string }>;
};

export function generateStaticParams() {
    return SIDO_LIST.map((sido) => ({ sido }));
}

// URL 파라미터는 percent-encoded·NFD로 들어올 수 있으므로 디코드+NFC 정규화 후 검증
// (/rankings/[sido]/page.tsx의 resolveSido()와 동일 원칙)
function resolveSido(raw: string): string | null {
    const decoded = decodeURIComponent(raw).normalize('NFC');
    return isValidSido(decoded) ? decoded : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { sido: rawSido } = await params;
    const sido = resolveSido(rawSido);
    if (!sido) return {};

    try {
        // generateMetadata와 RegionSidoIndexView 본문이 같은 request 내에서 dedup되도록 캐시된 함수 사용
        const items = await getCachedSigunguList(sido);
        return buildRegionSidoMetadata(sido, items.length);
    } catch {
        return {};
    }
}

export default async function RegionSidoPage({ params }: Props) {
    const { sido: rawSido } = await params;
    const sido = resolveSido(rawSido);
    if (!sido) notFound();

    return <RegionSidoIndexView sido={sido} />;
}
