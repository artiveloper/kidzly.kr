import type { Metadata } from 'next';
import RankingsPageView from '@/components/rankings/RankingsPageView';
import { buildRankingsMetadata } from '@/components/rankings/rankings-meta';

export const revalidate = 3600;

export const metadata: Metadata = buildRankingsMetadata();

export default function RankingsPage() {
    return <RankingsPageView />;
}
