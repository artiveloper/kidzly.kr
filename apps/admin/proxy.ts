// 모든 admin 경로에서 Supabase 세션을 갱신하고 미인증·비권한 접근을 /login 으로 돌려보낸다
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/session';
import { isAdminUser } from '@/lib/auth/admin-role';

const LOGIN_PATH = '/login';

export async function proxy(request: NextRequest) {
    const { response, user } = await updateSession(request);

    const isLoginPage = request.nextUrl.pathname === LOGIN_PATH;
    const isAdmin = isAdminUser(user);

    if (isAdmin) {
        if (!isLoginPage) return response;
        return redirectTo(request, '/', response);
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
