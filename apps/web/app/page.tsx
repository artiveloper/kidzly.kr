import { Suspense } from 'react'
import { runPrefetch } from '@/lib/react-query/prefetch'
import { daycarePrefetch } from '@/domain/daycare/server'
import { DEFAULT_BOUNDS } from '@/domain/daycare'
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider'
import DaycareMap from '@/components/daycare/common/DaycareMap'
import PromoToast from '@/components/common/PromoToast'
import { getAllPosts } from '@/lib/blog'

export default async function Page() {
    const state = await runPrefetch(
        daycarePrefetch.bounds({ bounds: DEFAULT_BOUNDS }),
        daycarePrefetch.typeNames(),
        daycarePrefetch.serviceTypes()
    )
    const promoPosts = getAllPosts().slice(0, 2)

    return (
        <HydrationBoundary state={state}>
            <div className="daum-wm-title hidden">어린이집 찾기 | 내 주변 국공립 어린이집 한눈에 비교 - 키즐리</div>
            <div className="daum-wm-content hidden">지도 기반으로 내 주변 어린이집을 빠르게 찾아보세요. 국공립·민간·가정 어린이집 비교 및 운영시간·대기 현황 확인 가능</div>
            <h1 className="sr-only">어린이집 찾기</h1>
            <Suspense>
                <DaycareMap promoPosts={promoPosts} />
            </Suspense>
            <PromoToast latestPost={promoPosts[0]} />
        </HydrationBoundary>
    )
}
