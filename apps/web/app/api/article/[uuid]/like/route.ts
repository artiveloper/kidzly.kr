import { NextResponse } from 'next/server';
import { createServerClient } from '@workspace/supabase/server';

type Params = { params: Promise<{ uuid: string }> };

export async function POST(req: Request, { params }: Params) {
    const { uuid } = await params;
    const body = await req.json().catch(() => ({}));
    const delta = body.delta === -1 ? -1 : 1;

    const supabase = createServerClient();

    const { error } = await supabase.rpc('toggle_like', { p_uuid: uuid, p_delta: delta });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
