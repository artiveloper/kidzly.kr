import type { MetadataRoute } from "next"
import { fetchDaycareIdsPaginated } from "@/domain/daycare/server"
import { fetchSidoNames } from "@/domain/region/server"
import { getAllPosts } from "@/lib/blog"

export const revalidate = 86400 // 24시간 캐시

const BASE_URL = "https://kidzly.kr"
const BATCH_SIZE = 1_000

// lastModified 규칙 — 실제 수정 시각의 근거가 있는 URL에만 넣고, 없으면 생략한다.
// 구글은 lastmod를 "일관되고 정확성을 검증할 수 있는 경우에만" 사용하므로, 빌드 시각 같은
// 부정확한 값이 섞이면 어린이집 상세 24,000여 건의 정확한 lastmod까지 함께 무시될 수 있다.

type DaycareSitemapEntry = { id: string; lastModified: string | null; sidoName: string | null }

// 배치 조회는 빌드 중 DB 부하가 몰리면 statement timeout이 날 수 있다. 실패를 삼키면 그 배치부터
// 끝까지가 사이트맵에서 조용히 사라지므로, 재시도한 뒤에도 실패하면 사이트맵 생성 자체를 실패시킨다.
const BATCH_RETRIES = 2

async function fetchDaycareBatch(offset: number): Promise<DaycareSitemapEntry[]> {
    for (let attempt = 0; ; attempt++) {
        try {
            return await fetchDaycareIdsPaginated({ offset, limit: BATCH_SIZE })
        } catch (error) {
            if (attempt >= BATCH_RETRIES) throw error
            await new Promise((resolve) => setTimeout(resolve, 1_000 * (attempt + 1)))
        }
    }
}

async function fetchAllDaycareEntries(): Promise<DaycareSitemapEntry[]> {
    const entries: DaycareSitemapEntry[] = []
    let offset = 0

    while (true) {
        const batch = await fetchDaycareBatch(offset)
        entries.push(...batch)
        if (batch.length < BATCH_SIZE) break
        offset += BATCH_SIZE
    }

    return entries
}

// 랭킹 페이지는 자체 콘텐츠가 아니라 어린이집 데이터의 파생물이므로, 그 데이터의 기준일 최대값을
// lastmod로 쓴다. data_standard_date는 'YYYY-MM-DD' 고정 포맷이라 문자열 비교로 최대값을 구할 수 있다.
function collectLatestDataDates(entries: DaycareSitemapEntry[]) {
    const bySido = new Map<string, string>()
    let overall: string | null = null

    for (const { lastModified, sidoName } of entries) {
        if (!lastModified) continue
        if (!overall || lastModified > overall) overall = lastModified
        if (!sidoName) continue

        const current = bySido.get(sidoName)
        if (!current || lastModified > current) bySido.set(sidoName, lastModified)
    }

    return { bySido, overall }
}

// 정적 페이지 시행일 — 각 page.tsx의 LAST_UPDATED 표시 문구와 동기화 필요
const PRIVACY_POLICY_UPDATED = new Date("2026-06-20")
const TERMS_UPDATED = new Date("2026-07-03")

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries = await fetchAllDaycareEntries()
    const sidoNames = await fetchSidoNames()
    const posts = getAllPosts()

    const { bySido: latestDataDateBySido, overall: latestDataDate } = collectLatestDataDates(entries)

    const daycareEntries: MetadataRoute.Sitemap = entries.map(({ id, lastModified }) => ({
        url: `${BASE_URL}/daycare/${id}`,
        lastModified: lastModified ? new Date(lastModified) : undefined,
        changeFrequency: "daily",
        priority: 0.7,
    }))

    const contentEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${BASE_URL}/contents/${encodeURIComponent(post.slug)}`,
        lastModified: new Date(post.updatedAt ?? post.publishedAt),
        changeFrequency: "monthly",
        priority: 0.6,
    }))

    return [
        {
            // 홈·지도·목록은 레이아웃이 바뀔 때만 갱신되므로 근거가 될 수정 시각이 없다 — lastModified 생략
            url: BASE_URL,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${BASE_URL}/map`,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/daycares`,
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/rankings`,
            lastModified: latestDataDate ? new Date(latestDataDate) : undefined,
            changeFrequency: "daily",
            priority: 0.8,
        },
        // 경로형 지역 랭킹 — 쿼리파라미터 대신 색인 가능한 개별 URL
        ...sidoNames.map((sido) => {
            const sidoDataDate = latestDataDateBySido.get(sido)

            return {
                url: `${BASE_URL}/rankings/${encodeURIComponent(sido)}`,
                lastModified: sidoDataDate ? new Date(sidoDataDate) : undefined,
                changeFrequency: "daily" as const,
                priority: 0.7,
            }
        }),
        {
            // 최신 글 발행일 기준 — 목록 페이지가 실제로 언제 바뀌었는지 반영
            url: `${BASE_URL}/contents`,
            lastModified: posts[0] ? new Date(posts[0].publishedAt) : undefined,
            changeFrequency: "weekly",
            priority: 0.6,
        },
        ...contentEntries,
        {
            url: `${BASE_URL}/about`,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/privacy-policy`,
            lastModified: PRIVACY_POLICY_UPDATED,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: TERMS_UPDATED,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        ...daycareEntries,
    ]
}
