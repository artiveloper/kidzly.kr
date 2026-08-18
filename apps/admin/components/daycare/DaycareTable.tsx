'use client'
// 어린이집 목록 표와 페이지 이동 — 데이터는 domain hook 에서만 가져온다

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
import { useDaycareList, type DaycareListItem } from '@/domain/daycare'
import DaycareDetailDialog from '@/components/daycare/DaycareDetailDialog'

export default function DaycareTable({
    keyword,
    page,
    onPageChange,
}: {
    keyword: string
    page: number
    onPageChange: (page: number) => void
}) {
    const { data } = useDaycareList({ keyword, page })
    const [selected, setSelected] = useState<DaycareListItem | null>(null)

    if (data.items.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>표시할 어린이집이 없습니다</EmptyTitle>
                    <EmptyDescription>
                        {keyword
                            ? `'${keyword}' 와 일치하는 어린이집명·주소가 없습니다. 검색어를 바꿔 보세요.`
                            : '등록된 어린이집이 없습니다.'}
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
                            <TableHead className="whitespace-nowrap">어린이집명</TableHead>
                            <TableHead>주소</TableHead>
                            <TableHead className="whitespace-nowrap">유형</TableHead>
                            <TableHead className="whitespace-nowrap">운영상태</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items.map((item) => (
                            <TableRow key={item.daycareCode}>
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
                                    {item.typeName ?? '-'}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {item.status ?? '-'}
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
                    {page.toLocaleString('ko-KR')} 페이지
                </p>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    disabled={!data.hasNext}
                    onClick={() => onPageChange(page + 1)}
                >
                    다음
                </Button>
            </nav>

            <DaycareDetailDialog daycare={selected} onClose={() => setSelected(null)} />
        </div>
    )
}
