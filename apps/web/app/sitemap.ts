import type { MetadataRoute } from "next"
import { fetchDaycareIdsPaginated } from "@/domain/daycare/server"

const BASE_URL = "https://kidzly.kr"
const BATCH_SIZE = 1_000

async function fetchAllDaycareIds(): Promise<string[]> {
    const ids: string[] = []
    let offset = 0

    while (true) {
        const batch = await fetchDaycareIdsPaginated({ offset, limit: BATCH_SIZE })
        ids.push(...batch)
        if (batch.length < BATCH_SIZE) break
        offset += BATCH_SIZE
    }

    return ids
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const ids = await fetchAllDaycareIds()

    const daycareEntries: MetadataRoute.Sitemap = ids.map((daycareId) => ({
        url: `${BASE_URL}/daycare/${daycareId}`,
        changeFrequency: "weekly",
        priority: 0.7,
    }))

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${BASE_URL}/about`,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        ...daycareEntries,
    ]
}
