// playgrounds 조회용 queryOptions 팩토리 — 훅과 prefetch 가 같은 queryKey 를 쓰도록 한다
import { queryOptions } from '@tanstack/react-query';
import { createAdminBrowserClient } from '@/lib/supabase/client';
import { fetchPlaygrounds } from '../apis/playground.api';
import { playgroundKeys } from '../query-keys/playground.query-keys';
import type { PlaygroundListParams } from '../types';

export function playgroundListOptions(params: PlaygroundListParams) {
    return queryOptions({
        queryKey: playgroundKeys.list(params),
        queryFn: () => fetchPlaygrounds(createAdminBrowserClient(), params),
    });
}
