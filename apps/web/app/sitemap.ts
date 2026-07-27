import type { MetadataRoute } from "next"
import { fetchDaycareIdsPaginated } from "@/domain/daycare/server"
import { SIDO_LIST } from "@/domain/region"
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries = await fetchAllDaycareEntries()

    const daycareEntries: MetadataRoute.Sitemap = entries.map(({ id, lastModified }) => ({
        url: `${BASE_URL}/daycare/${id}`,
        lastModified: lastModified ? new Date(lastModified) : undefined,
        changeFrequency: "weekly",
        priority: 0.7,
    }))

    const contentEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
        url: `${BASE_URL}/contents/${encodeURIComponent(post.slug)}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "monthly",
        priority: 0.6,
    }))

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${BASE_URL}/rankings`,
            changeFrequency: "daily",
            priority: 0.8,
        },
        // 경로형 지역 랭킹 — 쿼리파라미터 대신 색인 가능한 개별 URL
        ...SIDO_LIST.map((sido) => ({
            url: `${BASE_URL}/rankings/${encodeURIComponent(sido)}`,
            changeFrequency: "daily" as const,
            priority: 0.7,
        })),
        {
            url: `${BASE_URL}/contents`,
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
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        ...daycareEntries,
    ]
}
