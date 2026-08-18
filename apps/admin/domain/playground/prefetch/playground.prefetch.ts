import 'server-only';
// 서버에서 playgrounds 목록을 미리 채워 첫 렌더에 데이터가 있도록 한다
import type { QueryClient } from '@tanstack/react-query';
import { createAdminServerClient } from '@/lib/supabase/server';
import { fetchPlaygrounds } from '../apis/playground.api';
import { playgroundListOptions } from '../query-options/playground.query-options';
import type { PlaygroundListParams } from '../types';

export function prefetchPlaygroundList(params: PlaygroundListParams) {
    return async (queryClient: QueryClient) => {
        const supabase = await createAdminServerClient();
        await queryClient.prefetchQuery({
            ...playgroundListOptions(params),
            queryFn: () => fetchPlaygrounds(supabase, params),
        });
    };
}
