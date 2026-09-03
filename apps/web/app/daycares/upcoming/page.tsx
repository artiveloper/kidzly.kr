// 인허가예정 어린이집 목록 — 전국 기준, 지역 세그먼트를 두지 않는다
import type { Metadata } from 'next'
import { fetchSidoNames } from '@/domain/region/server'
import { getSidoShort } from '@/domain/region'
import { fetchDaycareRankingUpcoming } from '@/domain/daycare/server'
import { buildBreadcrumbJsonLd } from '@/lib/structured-data/breadcrumb'
import DaycaresShell from '@/components/daycare/list/DaycaresShell'
import UpcomingDaycareList from '@/components/home/UpcomingDaycareList'

const BASE_URL = 'https://kidzly.kr'
const URL = `${BASE_URL}/daycares/upcoming`
const TITLE = '인허가예정 어린이집 | 곧 문 여는 어린이집 - 키즐리'
const DESCRIPTION =
    '곧 인가를 받아 문을 열 어린이집을 인가 예정일이 가까운 순서로 확인하세요. 시도별로 걸러 볼 수 있습니다.'
const HEADING = '인허가예정 어린이집'
const LEAD = '곧 인가를 받아 문을 열 어린이집을 인가 예정일 순으로 보여드려요.'

export const revalidate = 3600

// 지역·필터 어느 것도 URL에서 읽지 않으므로 정적으로 생성되고 1시간마다 갱신된다.
// 인가 예정일이 지난 건은 다음 갱신에서 목록에서 빠진다.
export const metadata: Metadata = {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: URL },
    openGraph: {
        type: 'website',
        locale: 'ko_KR',
        siteName: '키즐리',
        url: URL,
        title: TITLE,
        description: DESCRIPTION,
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '인허가예정 어린이집 키즐리' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/og-image.png'],
    },
}

// 현재 전국 한 자릿수 수준이라 사실상 전수 노출 — 데이터 이상 유입 대비 안전장치로만 상한을 둔다
const UPCOMING_LIMIT = 100

export default async function UpcomingDaycaresPage() {
    const sidoNames = await fetchSidoNames()
    const [upcomingAll, ...upcomingBySido] = await Promise.all([
        fetchDaycareRankingUpcoming(UPCOMING_LIMIT),
        ...sidoNames.map((sido) => fetchDaycareRankingUpcoming(UPCOMING_LIMIT, sido)),
    ])
    const regions = [
        { key: '전체', label: '전체', items: upcomingAll },
        ...sidoNames.map((sido, i) => ({ key: sido, label: getSidoShort(sido), items: upcomingBySido[i] ?? [] })),
    ]

    const breadcrumbLd = buildBreadcrumbJsonLd([
        { name: '키즐리', url: BASE_URL },
        { name: '어린이집 목록', url: `${BASE_URL}/daycares` },
        { name: HEADING, url: URL },
    ])

    return (
        <DaycaresShell
            activeTab="upcoming"
            heading={HEADING}
            description={LEAD}
            seo={
                <>
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
                    />
                    <div className="daum-wm-title hidden">{TITLE}</div>
                    <div className="daum-wm-content hidden">{DESCRIPTION}</div>
                </>
            }
        >
            <UpcomingDaycareList regions={regions} />
        </DaycaresShell>
    )
}
