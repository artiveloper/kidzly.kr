import { NextResponse } from 'next/server';
import { createServerClient } from '@workspace/supabase/server';

type Params = { params: Promise<{ uuid: string }> };

export async function POST(_req: Request, { params }: Params) {
    const { uuid } = await params;
    const supabase = createServerClient();

    const { error } = await supabase.rpc('increment_view_count', { p_uuid: uuid });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
