import type { MetadataRoute } from 'next'
import { fetchDaycareCount, fetchDaycareIdsPaginated } from '@/domain/daycare/server'

const PAGE_SIZE = 50_000

export async function generateSitemaps() {
    const total = await fetchDaycareCount()
    const pages = Math.ceil(total / PAGE_SIZE) || 1
    return Array.from({ length: pages }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
    const ids = await fetchDaycareIdsPaginated({ offset: id * PAGE_SIZE, limit: PAGE_SIZE })

    return ids.map((daycareId) => ({
        url: `https://kidzly.kr/daycare/${daycareId}`,
        changeFrequency: 'weekly',
        priority: 0.7,
    }))
}
