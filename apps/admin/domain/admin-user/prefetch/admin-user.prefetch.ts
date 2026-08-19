import 'server-only';
// 서버에서 관리자 계정 목록을 미리 채운다 — HTTP 왕복 없이 Auth Admin API 를 직접 호출한다
import type { QueryClient } from '@tanstack/react-query';
import { listAdminUsers } from '../apis/admin-user.service';
import { adminUserListOptions } from '../query-options/admin-user.query-options';

export function prefetchAdminUserList() {
    return async (queryClient: QueryClient) => {
        await queryClient.prefetchQuery({
            ...adminUserListOptions(),
            queryFn: listAdminUsers,
        });
    };
}
