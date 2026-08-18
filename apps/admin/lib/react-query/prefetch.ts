import 'server-only'
// 서버 컴포넌트에서 여러 prefetch 를 한 번에 실행하고 dehydrate 결과를 돌려준다
import { dehydrate, type QueryClient } from '@tanstack/react-query'
import { getQueryClient } from './query-client'

export async function runPrefetch(...prefetchers: Array<(qc: QueryClient) => Promise<void>>) {
    const qc = getQueryClient()
    await Promise.all(prefetchers.map((fn) => fn(qc)))
    return dehydrate(qc)
}
