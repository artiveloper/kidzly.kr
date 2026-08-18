'use client'
// 어린이집 목록 화면 — 검색어·페이지를 URL 상태로 들고 표 영역만 Suspense 로 감싼다

import { Suspense } from 'react'
import { debounce, useQueryStates } from 'nuqs'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { daycareSearchParsers } from '@/domain/daycare'
import DaycareTable from '@/components/daycare/DaycareTable'
import DaycareTableSkeleton from '@/components/daycare/DaycareTableSkeleton'

export default function DaycareListView() {
    const [{ q, page }, setParams] = useQueryStates(daycareSearchParsers, {
        shallow: false,
        clearOnDefault: true,
    })

    return (
        <div className="space-y-4">
            <div className="w-full sm:max-w-sm">
                <Label htmlFor="daycare-keyword" className="sr-only">
                    어린이집명·주소 검색
                </Label>
                <Input
                    id="daycare-keyword"
                    type="search"
                    className="mt-1.5 h-11"
                    placeholder="어린이집 이름 또는 주소로 검색"
                    defaultValue={q}
                    onChange={(event) =>
                        setParams(
                            { q: event.target.value, page: 1 },
                            // 키 입력마다 조회하지 않도록 300ms 디바운스 후 URL 에 반영한다
                            { limitUrlUpdates: debounce(300) }
                        )
                    }
                />
            </div>

            <Suspense key={`${q}-${page}`} fallback={<DaycareTableSkeleton />}>
                <DaycareTable
                    keyword={q}
                    page={page}
                    onPageChange={(next) => setParams({ page: next })}
                />
            </Suspense>
        </div>
    )
}
