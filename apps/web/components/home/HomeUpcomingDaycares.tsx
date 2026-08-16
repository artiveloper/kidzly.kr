// 홈 "인허가 예정" 섹션 데이터 로딩 — 히어로와 분리해 Suspense 경계 안에서 단독 스트리밍
import { fetchDaycareRankingUpcoming } from '@/domain/daycare/server'
import UpcomingDaycareItem from './UpcomingDaycareItem'

export default async function HomeUpcomingDaycares() {
    const upcomingDaycares = await fetchDaycareRankingUpcoming(8)

    if (upcomingDaycares.length === 0) {
        return <p className="text-sm text-gray-400 text-center py-10">인허가 예정인 어린이집이 없습니다.</p>
    }

    return (
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {upcomingDaycares.map((item) => (
                <li key={item.id}>
                    <UpcomingDaycareItem item={item} />
                </li>
            ))}
        </ol>
    )
}
