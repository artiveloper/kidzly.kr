import type { Metadata } from 'next';
import RankingsPageView from '@/components/rankings/RankingsPageView';
import { buildRankingsMetadata } from '@/components/rankings/rankings-meta';

// 86400 = 24시간. 데이터가 하루 1회 동기화되므로 그에 맞춘다.
export const revalidate = 86400;

export const metadata: Metadata = buildRankingsMetadata();

export default function RankingsPage() {
    return <RankingsPageView />;
}
