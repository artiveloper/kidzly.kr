'use client'
// 놀거리 관리 화면 — 검색어·페이지를 URL 상태로 들고 표 영역만 Suspense 로 감싼다

import { Suspense, useState } from 'react'
import { debounce, useQueryStates } from 'nuqs'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { placeSearchParsers } from '@/domain/place'
import PlaceFormDialog from '@/components/place/PlaceFormDialog'
import PlaceTable from '@/components/place/PlaceTable'
import PlaceTableSkeleton from '@/components/place/PlaceTableSkeleton'

export default function PlaceListView() {
    const [{ q, page }, setParams] = useQueryStates(placeSearchParsers, {
        shallow: false,
        clearOnDefault: true,
    })
    const [createOpen, setCreateOpen] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full sm:max-w-sm">
                    <Label htmlFor="place-keyword" className="sr-only">
                        장소명·주소 검색
                    </Label>
                    <Input
                        id="place-keyword"
                        type="search"
                        className="mt-1.5 h-11"
                        placeholder="장소명 또는 주소로 검색"
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

                <Button type="button" className="h-11" onClick={() => setCreateOpen(true)}>
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
                    놀거리 등록
                </Button>
            </div>

            <Suspense key={`${q}-${page}`} fallback={<PlaceTableSkeleton />}>
                <PlaceTable
                    keyword={q}
                    page={page}
                    onPageChange={(next) => setParams({ page: next })}
                />
            </Suspense>

            <PlaceFormDialog open={createOpen} target={null} onClose={() => setCreateOpen(false)} />
        </div>
    )
}
