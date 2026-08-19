// 관리자 계정 목록 queryOptions 팩토리 — 훅과 prefetch 가 같은 queryKey 를 쓰도록 한다
import { queryOptions } from '@tanstack/react-query';
import { fetchAdminUsers } from '../apis/admin-user.api';
import { adminUserKeys } from '../query-keys/admin-user.query-keys';

export function adminUserListOptions() {
    return queryOptions({
        queryKey: adminUserKeys.list(),
        queryFn: fetchAdminUsers,
    });
}
