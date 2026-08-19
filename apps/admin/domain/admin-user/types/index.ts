// 관리자 계정(admin-user) 도메인에서 주고받는 타입과 정책 상수
export type AdminUser = {
    id: string;
    email: string;
    name: string;
    /** app_metadata.role 값. 이 화면에서 만드는 계정은 항상 'admin' 이다. */
    role: string;
    /** 최초 로그인 시 비밀번호를 바꿔야 하는 계정인지 */
    mustChangePassword: boolean;
    createdAt: string;
    lastSignInAt: string | null;
};

export type CreateAdminUserInput = {
    email: string;
    name: string;
};

export type UpdateAdminUserInput = {
    id: string;
    name: string;
};

/** 신규 계정과 비밀번호 초기화에 쓰는 고정 초기 비밀번호. 최초 로그인 시 반드시 변경하게 한다. */
export const ADMIN_INITIAL_PASSWORD = '12341234';

/** 비밀번호 최소 길이 — Supabase Auth 기본값과 맞춘다. */
export const ADMIN_PASSWORD_MIN_LENGTH = 8;
