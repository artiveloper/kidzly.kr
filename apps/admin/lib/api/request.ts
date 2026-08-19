import 'server-only';
// Route Handler 로 들어온 JSON 본문에서 문자열 필드를 안전하게 읽는다

export async function readJsonBody(request: Request): Promise<unknown> {
    return request.json().catch(() => null);
}

export function readString(body: unknown, key: string): string {
    if (typeof body !== 'object' || body === null) return '';
    const value = (body as Record<string, unknown>)[key];
    return typeof value === 'string' ? value.trim() : '';
}
