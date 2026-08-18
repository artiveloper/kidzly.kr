'use client'
// 놀이시설 목록 화면 — 검색어·페이지를 URL 상태로 들고 표 영역만 Suspense 로 감싼다

import { Suspense } from 'react'
import { debounce, useQueryStates } from 'nuqs'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { playgroundSearchParsers } from '@/domain/playground'
import PlaygroundTable from '@/components/playground/PlaygroundTable'
import PlaygroundTableSkeleton from '@/components/playground/PlaygroundTableSkeleton'

export default function PlaygroundListView() {
    const [{ q, page }, setParams] = useQueryStates(playgroundSearchParsers, {
        shallow: false,
        clearOnDefault: true,
    })

    return (
        <div className="space-y-4">
            <div className="w-full sm:max-w-sm">
                <Label htmlFor="playground-keyword">시설명·주소 검색</Label>
                <Input
                    id="playground-keyword"
                    type="search"
                    className="mt-1.5 h-11"
                    placeholder="예: 덕암초등학교, 경기 파주시"
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

            <Suspense key={`${q}-${page}`} fallback={<PlaygroundTableSkeleton />}>
                <PlaygroundTable
                    keyword={q}
                    page={page}
                    onPageChange={(next) => setParams({ page: next })}
                />
            </Suspense>
        </div>
    )
}
