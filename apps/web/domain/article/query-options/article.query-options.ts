import { queryOptions } from '@tanstack/react-query';
import { fetchContentStats } from '../apis/article.api';
import { articleKeys } from '../query-keys/article.query-keys';

export function contentStatsOptions(uuid: string) {
    return queryOptions({
        queryKey: articleKeys.stats(uuid),
        queryFn: () => fetchContentStats(uuid),
    });
}
