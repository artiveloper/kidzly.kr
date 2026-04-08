import { runPrefetch } from '@/lib/react-query/prefetch'
import { daycarePrefetch } from '@/domain/daycare/server'
import { DEFAULT_BOUNDS } from '@/domain/daycare'
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider'
import { MapLayout } from '@/components/daycare/common/MapLayout'

export default async function Page() {
    const state = await runPrefetch(
        daycarePrefetch.bounds({ bounds: DEFAULT_BOUNDS }),
        daycarePrefetch.typeNames(),
        daycarePrefetch.serviceTypes()
    )

    return (
        <HydrationBoundary state={state}>
            <MapLayout />
        </HydrationBoundary>
    )
}
