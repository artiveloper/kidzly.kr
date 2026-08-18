'use client'
// 어린이집 화면에서 조회가 실패했을 때의 라우트 바운더리

import { Button } from '@workspace/ui/components/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@workspace/ui/components/empty'

export default function DaycaresError({ reset }: { error: Error; reset: () => void }) {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>어린이집 정보를 불러오지 못했습니다</EmptyTitle>
                <EmptyDescription>
                    네트워크 상태를 확인한 뒤 다시 시도해 주세요.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button type="button" className="h-11" onClick={reset}>
                    다시 시도
                </Button>
            </EmptyContent>
        </Empty>
    )
}
