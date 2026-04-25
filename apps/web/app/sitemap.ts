import type { MetadataRoute } from "next"
import { fetchDaycareCount, fetchDaycareIdsPaginated } from "@/domain/daycare/server"

const BASE_URL = "https://kidzly.kr"
const PAGE_SIZE = 50_000

export async function generateSitemaps() {
    const count = await fetchDaycareCount()
    const pages = Math.ceil(count / PAGE_SIZE) || 1
    return Array.from({ length: pages }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
    const ids = await fetchDaycareIdsPaginated({ offset: id * PAGE_SIZE, limit: PAGE_SIZE })

    const daycareEntries: MetadataRoute.Sitemap = ids.map((daycareId) => ({
        url: `${BASE_URL}/daycare/${daycareId}`,
        changeFrequency: "weekly",
        priority: 0.7,
    }))

    if (id === 0) {
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

    return daycareEntries
}
