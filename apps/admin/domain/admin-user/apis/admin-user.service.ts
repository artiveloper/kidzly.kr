import 'server-only';
// Supabase Auth Admin API 로 관리자 계정을 조회·생성·수정·삭제하는 서버 전용 레이어
import type { User } from '@supabase/supabase-js';
import { createSupabaseAdminApiClient } from '@/lib/supabase/admin-api';
import { parseAdminUser } from '../parser/admin-user.parser';
import {
    ADMIN_INITIAL_PASSWORD,
    type AdminUser,
    type CreateAdminUserInput,
    type UpdateAdminUserInput,
} from '../types';

/** Auth Admin API 한 번 호출로 받아올 최대 건수. 전체를 받을 때까지 다음 페이지를 이어 읽는다. */
const FETCH_PER_PAGE = 200;

/** 이 화면에서 만드는 계정은 예외 없이 admin role 을 가진다. */
const ADMIN_ROLE = 'admin';

/** 호출자에게 그대로 보여줄 수 있는 실패. status 를 그대로 응답 코드로 쓴다. */
export class AdminUserServiceError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'AdminUserServiceError';
        this.status = status;
    }
}

/** 관리자 계정은 수가 적어 페이징 없이 전부 조회한다. */
export async function listAdminUsers(): Promise<AdminUser[]> {
    const supabase = createSupabaseAdminApiClient();
    const items: AdminUser[] = [];
    let page = 1;

    // listUsers 는 한 번에 전부 주지 않으므로 nextPage 가 없을 때까지 이어 읽는다
    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({
            page,
            perPage: FETCH_PER_PAGE,
        });
        if (error) throw new AdminUserServiceError(502, '계정 목록을 불러오지 못했습니다.');

        items.push(...data.users.map(parseAdminUser));
        if (!data.nextPage) return items;
        page = data.nextPage;
    }
}

export async function createAdminUser({ email, name }: CreateAdminUserInput) {
    const supabase = createSupabaseAdminApiClient();

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: ADMIN_INITIAL_PASSWORD,
        // 관리자가 직접 만드는 계정이라 확인 메일 없이 바로 로그인할 수 있게 한다
        email_confirm: true,
        app_metadata: { role: ADMIN_ROLE },
        user_metadata: { name, must_change_password: true },
    });
    if (error) {
        if (error.status === 422 || error.code === 'email_exists') {
            throw new AdminUserServiceError(409, '이미 등록된 이메일입니다.');
        }
        throw new AdminUserServiceError(502, '계정을 생성하지 못했습니다.');
    }

    return parseAdminUser(data.user);
}

export async function updateAdminUser({ id, name }: UpdateAdminUserInput) {
    const target = await getUserOrThrow(id);

    const supabase = createSupabaseAdminApiClient();
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
        // 다른 메타데이터(must_change_password 등)를 지우지 않도록 기존 값 위에 덮어쓴다
        user_metadata: { ...target.user_metadata, name },
    });
    if (error) throw new AdminUserServiceError(502, '계정을 수정하지 못했습니다.');

    return parseAdminUser(data.user);
}

/** 비밀번호를 초기값으로 되돌리고, 다음 로그인에서 다시 변경하도록 표시한다. */
export async function resetAdminUserPassword(id: string) {
    const target = await getUserOrThrow(id);

    const supabase = createSupabaseAdminApiClient();
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
        password: ADMIN_INITIAL_PASSWORD,
        user_metadata: { ...target.user_metadata, must_change_password: true },
    });
    if (error) throw new AdminUserServiceError(502, '비밀번호를 초기화하지 못했습니다.');

    return parseAdminUser(data.user);
}

export async function deleteAdminUser(id: string) {
    const supabase = createSupabaseAdminApiClient();
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw new AdminUserServiceError(502, '계정을 삭제하지 못했습니다.');
}

async function getUserOrThrow(id: string): Promise<User> {
    const supabase = createSupabaseAdminApiClient();
    const { data, error } = await supabase.auth.admin.getUserById(id);
    if (error || !data.user) throw new AdminUserServiceError(404, '계정을 찾을 수 없습니다.');
    return data.user;
}
