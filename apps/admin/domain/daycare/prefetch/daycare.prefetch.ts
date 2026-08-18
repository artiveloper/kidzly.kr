import 'server-only';
// 서버에서 daycares 목록을 미리 채워 첫 렌더에 데이터가 있도록 한다
import type { QueryClient } from '@tanstack/react-query';
import { createAdminServerClient } from '@/lib/supabase/server';
import { fetchDaycares } from '../apis/daycare.api';
import { daycareListOptions } from '../query-options/daycare.query-options';
import type { DaycareListParams } from '../types';

export function prefetchDaycareList(params: DaycareListParams) {
    return async (queryClient: QueryClient) => {
        const supabase = await createAdminServerClient();
        await queryClient.prefetchQuery({
            ...daycareListOptions(params),
            queryFn: () => fetchDaycares(supabase, params),
        });
    };
}
