'use client';

import { useQuery } from '@tanstack/react-query';
import { contentStatsOptions } from '../query-options/article.query-options';

export function useContentStats(uuid: string) {
    return useQuery(contentStatsOptions(uuid));
}
