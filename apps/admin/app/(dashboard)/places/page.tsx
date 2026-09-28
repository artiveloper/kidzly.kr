// 놀거리 목록·관리 페이지 — URL 의 검색어·페이지로 첫 페이지를 서버에서 미리 채운다
import type { Metadata } from 'next'
import { loadPlaceSearchParams, prefetchPlaceList } from '@/domain/place/server'
import { runPrefetch } from '@/lib/react-query/prefetch'
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider'
import PlaceListView from '@/components/place/PlaceListView'

export const metadata: Metadata = {
    title: '놀거리 관리',
}

export default async function PlacesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const { q, page } = await loadPlaceSearchParams(searchParams)
    const state = await runPrefetch(prefetchPlaceList({ keyword: q, page }))

    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">놀거리 관리</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    운영자가 직접 입력·검증하는 데이터다. 공개로 바꾸기 전까지는 지도에 노출되지 않는다.
                </p>
            </div>
            <HydrationBoundary state={state}>
                <PlaceListView />
            </HydrationBoundary>
        </section>
    )
}
