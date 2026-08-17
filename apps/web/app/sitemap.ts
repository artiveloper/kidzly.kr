import type { MetadataRoute } from "next"
import { fetchDaycareIdsPaginated } from "@/domain/daycare/server"
import { fetchSidoNames } from "@/domain/region/server"
import { getAllPosts } from "@/lib/blog"

export const revalidate = 86400 // 24시간 캐시

const BASE_URL = "https://kidzly.kr"
const BATCH_SIZE = 1_000

async function fetchAllDaycareEntries(): Promise<{ id: string; lastModified: string | null }[]> {
    const entries: { id: string; lastModified: string | null }[] = []
    let offset = 0

    while (true) {
        const batch = await fetchDaycareIdsPaginated({ offset, limit: BATCH_SIZE })
        entries.push(...batch)
        if (batch.length < BATCH_SIZE) break
        offset += BATCH_SIZE
    }

    return entries
}

// 정적 페이지 시행일 — 각 page.tsx의 LAST_UPDATED 표시 문구와 동기화 필요
const PRIVACY_POLICY_UPDATED = new Date("2026-06-20")
const TERMS_UPDATED = new Date("2026-07-03")

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries = await fetchAllDaycareEntries()
    const sidoNames = await fetchSidoNames()
    const posts = getAllPosts()

    // sitemap 자체 재생성 시각 — /rankings는 revalidate 3600(1시간)으로 데이터가 계속 갱신되므로
    // 리전별 실제 갱신 시각 대신 sitemap 빌드 시각을 근사치로 사용
    const now = new Date()

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
            url: BASE_URL,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${BASE_URL}/map`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/daycares`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/rankings`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
        // 경로형 지역 랭킹 — 쿼리파라미터 대신 색인 가능한 개별 URL
        ...sidoNames.map((sido) => ({
            url: `${BASE_URL}/rankings/${encodeURIComponent(sido)}`,
            lastModified: now,
            changeFrequency: "daily" as const,
            priority: 0.7,
        })),
        {
            // 최신 글 발행일 기준 — 목록 페이지가 실제로 언제 바뀌었는지 반영
            url: `${BASE_URL}/contents`,
            lastModified: posts[0] ? new Date(posts[0].publishedAt) : now,
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
