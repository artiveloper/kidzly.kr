// 관리자 대시보드 — 지표 위젯이 들어갈 자리를 빈 상태로 잡아둔다
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

const PLACEHOLDERS = [
    {
        title: '어린이집 현황',
        description: 'daycares 테이블의 시도·시군구별 등록 수를 여기에 표시한다.',
    },
    {
        title: '콘텐츠 조회수',
        description: 'content_stats 의 글별 조회수와 좋아요 수를 여기에 표시한다.',
    },
    {
        title: '동기화 이력',
        description: 'sync_histories 의 최근 실행 결과와 실패 건을 여기에 표시한다.',
    },
] as const

export default function DashboardPage() {
    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">대시보드</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    로그인·권한 확인까지 구성된 상태다. 아래 지표는 다음 단계에서 연결한다.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PLACEHOLDERS.map((item) => (
                    <Card key={item.title}>
                        <CardHeader>
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                아직 연결된 데이터가 없다.
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
