import type { MetadataRoute } from "next"
import { fetchDaycareCount, fetchDaycareIdsPaginated } from "@/domain/daycare/server"

const BASE_URL = "https://kidzly.kr"
const BATCH_SIZE = 1000

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const count = await fetchDaycareCount()

    const batches = Math.ceil(count / BATCH_SIZE)
    const idBatches = await Promise.all(
        Array.from({ length: batches }, (_, i) =>
            fetchDaycareIdsPaginated({ offset: i * BATCH_SIZE, limit: BATCH_SIZE })
        )
    )
    const ids = idBatches.flat()

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        ...ids.map((id) => ({
            url: `${BASE_URL}/daycare/${id}`,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        })),
    ]
}
