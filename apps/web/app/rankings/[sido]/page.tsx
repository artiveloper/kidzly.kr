import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchSidoNames } from '@/domain/region/server';
import RankingsPageView from '@/components/rankings/RankingsPageView';
import { buildRankingsMetadata } from '@/components/rankings/rankings-meta';

export const revalidate = 3600;
// sigungus에 있는 시도만 유효 — 그 외 경로는 라우팅 단계에서 404 처리해 중복/soft-200 방지
export const dynamicParams = false;

type Props = {
    params: Promise<{ sido: string }>;
};

export async function generateStaticParams() {
    const sidoNames = await fetchSidoNames();
    return sidoNames.map((sido) => ({ sido }));
}

// URL 파라미터는 percent-encoded·NFD로 들어올 수 있으므로 디코드+NFC 정규화 후 검증
async function resolveSido(raw: string): Promise<string | null> {
    const decoded = decodeURIComponent(raw).normalize('NFC');
    const sidoNames = await fetchSidoNames();
    return sidoNames.includes(decoded) ? decoded : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { sido } = await params;
    const valid = await resolveSido(sido);
    if (!valid) return {};
    return buildRankingsMetadata(valid);
}

export default async function RankingsSidoPage({ params }: Props) {
    const { sido } = await params;
    const valid = await resolveSido(sido);
    if (!valid) notFound();

    return <RankingsPageView sido={valid} />;
}
