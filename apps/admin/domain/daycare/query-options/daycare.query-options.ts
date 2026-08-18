// daycares 조회용 queryOptions 팩토리 — 훅과 prefetch 가 같은 queryKey 를 쓰도록 한다
import { queryOptions } from '@tanstack/react-query';
import { createAdminBrowserClient } from '@/lib/supabase/client';
import { fetchDaycare, fetchDaycares } from '../apis/daycare.api';
import { daycareKeys } from '../query-keys/daycare.query-keys';
import type { DaycareListParams } from '../types';

export function daycareListOptions(params: DaycareListParams) {
    return queryOptions({
        queryKey: daycareKeys.list(params),
        queryFn: () => fetchDaycares(createAdminBrowserClient(), params),
    });
}

export function daycareDetailOptions(daycareCode: string) {
    return queryOptions({
        queryKey: daycareKeys.detail(daycareCode),
        queryFn: () => fetchDaycare(createAdminBrowserClient(), daycareCode),
    });
}
