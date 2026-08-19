'use client';
// 관리자 계정 목록 조회와 생성·수정·비밀번호 초기화·삭제 뮤테이션 훅
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
    requestCreateAdminUser,
    requestDeleteAdminUser,
    requestResetAdminUserPassword,
    requestUpdateAdminUser,
} from '../apis/admin-user.api';
import { adminUserKeys } from '../query-keys/admin-user.query-keys';
import { adminUserListOptions } from '../query-options/admin-user.query-options';

export function useAdminUserList() {
    return useSuspenseQuery(adminUserListOptions());
}

function useInvalidateAdminUserList() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: adminUserKeys.list() });
}

export function useCreateAdminUser() {
    const invalidate = useInvalidateAdminUserList();
    return useMutation({ mutationFn: requestCreateAdminUser, onSuccess: invalidate });
}

export function useUpdateAdminUser() {
    const invalidate = useInvalidateAdminUserList();
    return useMutation({ mutationFn: requestUpdateAdminUser, onSuccess: invalidate });
}

export function useResetAdminUserPassword() {
    const invalidate = useInvalidateAdminUserList();
    return useMutation({ mutationFn: requestResetAdminUserPassword, onSuccess: invalidate });
}

export function useDeleteAdminUser() {
    const invalidate = useInvalidateAdminUserList();
    return useMutation({ mutationFn: requestDeleteAdminUser, onSuccess: invalidate });
}
