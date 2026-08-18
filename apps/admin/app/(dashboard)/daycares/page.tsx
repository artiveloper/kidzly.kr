// 어린이집 목록 페이지 — URL 의 검색어·페이지로 첫 페이지를 서버에서 미리 채운다
import type { Metadata } from 'next'
import { loadDaycareSearchParams, prefetchDaycareList } from '@/domain/daycare/server'
import { runPrefetch } from '@/lib/react-query/prefetch'
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider'
import DaycareListView from '@/components/daycare/DaycareListView'

export const metadata: Metadata = {
    title: '어린이집 목록',
}

export default async function DaycaresPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const { q, page } = await loadDaycareSearchParams(searchParams)
    const state = await runPrefetch(prefetchDaycareList({ keyword: q, page }))

    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">어린이집 목록</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    동기화 배치가 소유하는 데이터라 여기서는 수정하지 않는다.
                </p>
            </div>
            <HydrationBoundary state={state}>
                <DaycareListView />
            </HydrationBoundary>
        </section>
    )
}
