import { isServer } from '@tanstack/react-query';
import { createServerClient } from '@/lib/supabase/server';
import { createBrowserClient } from '@/lib/supabase/client';
import type { ContentStats } from '../types';

function createSupabaseClient() {
    return isServer ? createServerClient() : createBrowserClient();
}

export async function fetchContentStats(uuid: string): Promise<ContentStats> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('content_stats')
        .select('uuid, view_count, like_count')
        .eq('uuid', uuid)
        .single();

    if (error) {
        return { uuid, viewCount: 0, likeCount: 0 };
    }

    return {
        uuid: data.uuid,
        viewCount: data.view_count,
        likeCount: data.like_count,
    };
}
