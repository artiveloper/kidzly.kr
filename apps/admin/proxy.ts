// 모든 admin 경로에서 Supabase 세션을 갱신하고, 미인증·비권한 접근과 초기 비밀번호 미변경 계정을 걸러낸다
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/session';
import { isAdminUser, mustChangePassword } from '@/lib/auth/admin-role';

const LOGIN_PATH = '/login';
const CHANGE_PASSWORD_PATH = '/change-password';

export async function proxy(request: NextRequest) {
    const { response, user } = await updateSession(request);

    const { pathname } = request.nextUrl;

    // API 는 리다이렉트 대신 각 Route Handler 의 requireAdmin 이 JSON 으로 응답하게 둔다
    if (pathname.startsWith('/api/')) return response;

    const isLoginPage = pathname === LOGIN_PATH;
    const isChangePasswordPage = pathname === CHANGE_PASSWORD_PATH;
    const isAdmin = isAdminUser(user);

    if (isAdmin) {
        // 초기 비밀번호를 아직 바꾸지 않은 계정은 변경 화면 밖으로 나가지 못하게 한다
        if (mustChangePassword(user)) {
            if (isChangePasswordPage) return response;
            return redirectTo(request, CHANGE_PASSWORD_PATH, response);
        }
        if (isLoginPage || isChangePasswordPage) return redirectTo(request, '/', response);
        return response;
    }

    if (isLoginPage) return response;

    // 로그인은 됐지만 admin 권한이 없는 경우와 아예 미인증인 경우를 구분해 알린다
    const target = new URL(LOGIN_PATH, request.url);
    if (user) target.searchParams.set('error', 'forbidden');
    return redirectTo(request, target, response);
}

function redirectTo(request: NextRequest, to: string | URL, from: NextResponse) {
    const redirect = NextResponse.redirect(new URL(to, request.url));
    for (const cookie of from.cookies.getAll()) {
        redirect.cookies.set(cookie);
    }
    return redirect;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
