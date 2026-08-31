import type { Metadata } from 'next'
import { Suspense } from 'react'
import { runPrefetch } from '@/lib/react-query/prefetch'
import { daycarePrefetch } from '@/domain/daycare/server'
import { DEFAULT_BOUNDS } from '@/domain/daycare'
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider'
import DaycareMap from '@/components/daycare/common/DaycareMap'
import PromoToast from '@/components/common/PromoToast'
import { getAllPosts } from '@/lib/blog'

const TITLE = '어린이집 지도 검색 | 내 주변 국공립 어린이집 한눈에 비교 - 키즐리'
const DESCRIPTION =
    '지도에서 내 주변 어린이집을 빠르게 찾아보세요. 국공립·민간·가정 어린이집을 위치별로 비교하고, 정원·대기 현황과 운영시간, 통학 거리까지 지도 위에서 한눈에 확인할 수 있습니다.'

export const metadata: Metadata = {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: 'https://kidzly.kr/map' },
    openGraph: {
        type: 'website',
        locale: 'ko_KR',
        siteName: '키즐리',
        url: 'https://kidzly.kr/map',
        title: TITLE,
        description: DESCRIPTION,
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '어린이집 지도 검색 키즐리' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/og-image.png'],
    },
}

export default async function MapPage() {
    const state = await runPrefetch(
        daycarePrefetch.bounds({ bounds: DEFAULT_BOUNDS }),
    )
    const allPosts = getAllPosts()
    const promoPosts = allPosts.slice(0, 2)
    const latestPosts = allPosts.slice(0, 4)

    return (
        <HydrationBoundary state={state}>
            <div className="daum-wm-title hidden">{TITLE}</div>
            <div className="daum-wm-content hidden">{DESCRIPTION}</div>
            <h1 className="sr-only">어린이집 찾기</h1>
            <Suspense>
                <DaycareMap promoPosts={promoPosts} latestPosts={latestPosts} />
            </Suspense>
            <PromoToast latestPost={promoPosts[0]} />
        </HydrationBoundary>
    )
}
