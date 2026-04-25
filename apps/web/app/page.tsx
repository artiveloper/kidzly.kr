import { Suspense } from 'react'
import { runPrefetch } from '@/lib/react-query/prefetch'
import { daycarePrefetch } from '@/domain/daycare/server'
import { DEFAULT_BOUNDS } from '@/domain/daycare'
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider'
import { DaycareMap } from '@/components/daycare/common/DaycareMap'

export default async function Page() {
    const state = await runPrefetch(
        daycarePrefetch.bounds({ bounds: DEFAULT_BOUNDS }),
        daycarePrefetch.typeNames(),
        daycarePrefetch.serviceTypes()
    )

    return (
        <HydrationBoundary state={state}>
            <h1 className="sr-only">어린이집 찾기</h1>
            <Suspense>
                <DaycareMap />
            </Suspense>
        </HydrationBoundary>
    )
}
