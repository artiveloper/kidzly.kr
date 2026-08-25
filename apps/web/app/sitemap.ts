import type { MetadataRoute } from "next"
import { fetchDaycareIdsPaginated } from "@/domain/daycare/server"
import { fetchSidoNames, fetchSigunguNames } from "@/domain/region/server"
import { getAllPosts } from "@/lib/blog"

export const revalidate = 86400 // 24시간 캐시

const BASE_URL = "https://kidzly.kr"
const BATCH_SIZE = 1_000

// lastModified 규칙 — 실제 수정 시각의 근거가 있는 URL에만 넣고, 없으면 생략한다.
// 구글은 lastmod를 "일관되고 정확성을 검증할 수 있는 경우에만" 사용하므로, 빌드 시각 같은
// 부정확한 값이 섞이면 어린이집 상세 24,000여 건의 정확한 lastmod까지 함께 무시될 수 있다.
//
// priority·changefreq는 쓰지 않는다 — 구글이 두 값을 명시적으로 무시하고, sitemaps.org 규격도
// priority가 "검색 엔진의 결과 페이지에서 URL의 순위에 별 영향을 미치지 않는다", changefreq는
// "힌트이지 명령이 아니다"라고 못박는다. 네이버·다음이 사용한다는 근거도 찾지 못했다(2026-08-19).

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
const EDITORIAL_POLICY_UPDATED = new Date("2026-08-20")

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries = await fetchAllDaycareEntries()
    const sidoNames = await fetchSidoNames()
    const sigunguEntries = await fetchSigunguNames()
    const posts = getAllPosts()

    const { bySido: latestDataDateBySido, overall: latestDataDate } = collectLatestDataDates(entries)

    const daycareEntries: MetadataRoute.Sitemap = entries.map(({ id, lastModified }) => ({
        url: `${BASE_URL}/daycare/${id}`,
        lastModified: lastModified ? new Date(lastModified) : undefined,
    }))

    const contentEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${BASE_URL}/contents/${encodeURIComponent(post.slug)}`,
        lastModified: new Date(post.updatedAt ?? post.publishedAt),
    }))

    return [
        {
            // 홈·지도·목록은 레이아웃이 바뀔 때만 갱신되므로 근거가 될 수정 시각이 없다 — lastModified 생략
            url: BASE_URL,
        },
        {
            url: `${BASE_URL}/map`,
        },
        {
            url: `${BASE_URL}/daycares`,
        },
        // 시군구 지역별 목록 — 어린이집 상세로 가는 내부 링크 허브이자 "OO구 어린이집" 검색의 착지점.
        // 경로형이 아닌 쿼리 파라미터 URL이지만 지역마다 제목·설명·canonical이 갈라져 있어 개별 색인 대상이다.
        ...sigunguEntries.map(({ sido, arcode }) => {
            const sidoDataDate = latestDataDateBySido.get(sido)

            return {
                url: `${BASE_URL}/daycares?arcode=${arcode}`,
                lastModified: sidoDataDate ? new Date(sidoDataDate) : undefined,
            }
        }),
        {
            url: `${BASE_URL}/rankings`,
            lastModified: latestDataDate ? new Date(latestDataDate) : undefined,
        },
        // 경로형 지역 랭킹 — 쿼리파라미터 대신 색인 가능한 개별 URL
        ...sidoNames.map((sido) => {
            const sidoDataDate = latestDataDateBySido.get(sido)

            return {
                url: `${BASE_URL}/rankings/${encodeURIComponent(sido)}`,
                lastModified: sidoDataDate ? new Date(sidoDataDate) : undefined,
            }
        }),
        {
            // 최신 글 발행일 기준 — 목록 페이지가 실제로 언제 바뀌었는지 반영
            url: `${BASE_URL}/contents`,
            lastModified: posts[0] ? new Date(posts[0].publishedAt) : undefined,
        },
        ...contentEntries,
        {
            url: `${BASE_URL}/about`,
        },
        {
            url: `${BASE_URL}/about/editorial`,
            lastModified: EDITORIAL_POLICY_UPDATED,
        },
        {
            url: `${BASE_URL}/privacy-policy`,
            lastModified: PRIVACY_POLICY_UPDATED,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: TERMS_UPDATED,
        },
        ...daycareEntries,
    ]
}
