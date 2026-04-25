import type { MetadataRoute } from "next"
import { fetchDaycareIdsPaginated } from "@/domain/daycare/server"

const BASE_URL = "https://kidzly.kr"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const ids = await fetchDaycareIdsPaginated({ offset: 0, limit: 50_000 })

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
