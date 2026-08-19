// 관리자 계정 도메인의 React Query 키 팩토리
export const adminUserKeys = {
    all: ['admin-user'] as const,
    list: () => [...adminUserKeys.all, 'list'] as const,
};
