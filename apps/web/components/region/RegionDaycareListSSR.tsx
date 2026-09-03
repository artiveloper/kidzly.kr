// 지역 목록을 서버에서 미리 채워 첫 렌더에 데이터가 실려 나가게 한다
//
// 이 조회만 따로 떼어 <Suspense> 안에 둔다 — 칩 목록과 함께 두면 시군구를 고를 때마다
// 목록 조회를 기다리느라 칩까지 스켈레톤에 덮인다. 칩은 즉시 렌더되고 목록만 스트리밍된다.
import { runPrefetch } from '@/lib/react-query/prefetch';
import { daycarePrefetch } from '@/domain/daycare/server';
import type { DaycareRegionListParams } from '@/domain/daycare';
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider';
import RegionDaycareList from './RegionDaycareList';

type Props = {
    /** sigungus.arcode와 동일한 값 공간의 시군구 코드 */
    sigunguCode: string;
    /** URL의 필터를 그대로 실어야 클라이언트 hook과 queryKey가 어긋나지 않는다 */
    filters: Omit<DaycareRegionListParams, 'sigunguCode'>;
};

export default async function RegionDaycareListSSR({ sigunguCode, filters }: Props) {
    const state = await runPrefetch(daycarePrefetch.regionList({ sigunguCode, ...filters }));

    return (
        <HydrationBoundary state={state}>
            <RegionDaycareList sigunguCode={sigunguCode} />
        </HydrationBoundary>
    );
}
