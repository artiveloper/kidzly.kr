'use client'
// 놀이시설 목록 표와 페이지 이동 — 데이터는 domain hook 에서만 가져온다

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@workspace/ui/components/empty'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import {
    INDOOR_OUTDOOR_LABEL,
    OPERATION_LABEL,
    OWNERSHIP_LABEL,
    PLAYGROUND_PAGE_SIZE,
    formatCode,
    usePlaygroundList,
    type Playground,
} from '@/domain/playground'
import PlaygroundDetailDialog from '@/components/playground/PlaygroundDetailDialog'

export default function PlaygroundTable({
    keyword,
    page,
    onPageChange,
}: {
    keyword: string
    page: number
    onPageChange: (page: number) => void
}) {
    const { data } = usePlaygroundList({ keyword, page })
    const [selected, setSelected] = useState<Playground | null>(null)
    const totalPages = Math.max(1, Math.ceil(data.totalCount / PLAYGROUND_PAGE_SIZE))

    if (data.items.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>표시할 놀이시설이 없습니다</EmptyTitle>
                    <EmptyDescription>
                        {keyword
                            ? `'${keyword}' 와 일치하는 시설명·주소가 없습니다. 검색어를 바꿔 보세요.`
                            : '등록된 놀이시설이 없습니다.'}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap">
                                시설 · {data.totalCount.toLocaleString('ko-KR')}건
                            </TableHead>
                            <TableHead className="whitespace-nowrap">주소</TableHead>
                            <TableHead className="whitespace-nowrap">민간/공공구분</TableHead>
                            <TableHead className="whitespace-nowrap">실내외</TableHead>
                            <TableHead className="whitespace-nowrap">운영구분</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items.map((item) => (
                            <TableRow key={item.facilityId}>
                                <TableCell className="font-medium">
                                    <button
                                        type="button"
                                        className="-my-2 py-2 text-left hover:underline"
                                        onClick={() => setSelected(item)}
                                    >
                                        {item.name}
                                    </button>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {item.address ?? '-'}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {formatCode(OWNERSHIP_LABEL, item.ownershipCode)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {formatCode(INDOOR_OUTDOOR_LABEL, item.indoorOutdoorCode)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {formatCode(OPERATION_LABEL, item.operationCode)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <nav aria-label="페이지 이동" className="flex items-center justify-between gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    이전
                </Button>
                <p className="text-muted-foreground text-sm" aria-live="polite">
                    {page.toLocaleString('ko-KR')} / {totalPages.toLocaleString('ko-KR')} 페이지
                </p>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    다음
                </Button>
            </nav>

            <PlaygroundDetailDialog playground={selected} onClose={() => setSelected(null)} />
        </div>
    )
}
