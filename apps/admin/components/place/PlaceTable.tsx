'use client'
// 놀거리 목록 표와 수정·삭제 동작 — 데이터는 domain hook 에서만 가져온다

import { useState } from 'react'
import { Badge } from '@workspace/ui/components/badge'
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
    PLACE_AGE_GROUP_LABEL,
    PLACE_INDOOR_OUTDOOR_LABEL,
    PLACE_PAGE_SIZE,
    PLACE_TYPE_LABEL,
    useDeletePlace,
    usePlaceList,
    type Place,
} from '@/domain/place'
import { formatDate } from '@/lib/format'
import PlaceFormDialog from '@/components/place/PlaceFormDialog'
// 되돌리기 어려운 동작을 확인받는 범용 다이얼로그 — 계정 화면에서 먼저 쓰였을 뿐 계정 전용은 아니다
import ConfirmDialog from '@/components/admin-user/AdminUserConfirmDialog'

export default function PlaceTable({
    keyword,
    page,
    onPageChange,
}: {
    keyword: string
    page: number
    onPageChange: (page: number) => void
}) {
    const { data } = usePlaceList({ keyword, page })
    const [editTarget, setEditTarget] = useState<Place | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Place | null>(null)
    const remove = useDeletePlace()
    const totalPages = Math.max(1, Math.ceil(data.totalCount / PLACE_PAGE_SIZE))

    const closeDelete = () => {
        setDeleteTarget(null)
        remove.reset()
    }

    if (data.items.length === 0) {
        return (
            <>
                <Empty>
                    <EmptyHeader>
                        <EmptyTitle>표시할 놀거리가 없습니다</EmptyTitle>
                        <EmptyDescription>
                            {keyword
                                ? `'${keyword}' 와 일치하는 장소명·주소가 없습니다. 검색어를 바꿔 보세요.`
                                : '아직 등록된 놀거리가 없습니다. 오른쪽 위에서 등록하세요.'}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
                <PlaceFormDialog
                    open={editTarget !== null}
                    target={editTarget}
                    onClose={() => setEditTarget(null)}
                />
            </>
        )
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap">
                                장소 · {data.totalCount.toLocaleString('ko-KR')}건
                            </TableHead>
                            <TableHead className="whitespace-nowrap">유형</TableHead>
                            <TableHead className="whitespace-nowrap">대상연령</TableHead>
                            <TableHead className="whitespace-nowrap">실내외</TableHead>
                            <TableHead className="whitespace-nowrap">입장료</TableHead>
                            <TableHead className="whitespace-nowrap">최종 확인일</TableHead>
                            <TableHead className="whitespace-nowrap">공개</TableHead>
                            <TableHead className="whitespace-nowrap text-right">관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <button
                                        type="button"
                                        className="-my-2 py-2 text-left hover:underline"
                                        onClick={() => setEditTarget(item)}
                                    >
                                        {item.name}
                                    </button>
                                    <span className="text-muted-foreground block text-xs">
                                        {item.address}
                                    </span>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {PLACE_TYPE_LABEL[item.placeType]}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {item.ageGroups.length > 0
                                        ? item.ageGroups
                                              .map((age) => PLACE_AGE_GROUP_LABEL[age])
                                              .join(', ')
                                        : '-'}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {PLACE_INDOOR_OUTDOOR_LABEL[item.indoorOutdoor]}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {item.isFree ? '무료' : '유료'}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {formatDate(item.lastVerifiedAt)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                                        {item.isPublished ? '공개' : '초안'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-right">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-11"
                                        onClick={() => setEditTarget(item)}
                                    >
                                        수정
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive ml-2 h-11"
                                        onClick={() => setDeleteTarget(item)}
                                    >
                                        삭제
                                    </Button>
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

            <PlaceFormDialog
                open={editTarget !== null}
                target={editTarget}
                onClose={() => setEditTarget(null)}
            />

            <ConfirmDialog
                open={deleteTarget !== null}
                title="놀거리를 삭제할까요?"
                description={`'${deleteTarget?.name ?? ''}' 을(를) 삭제한다. 되돌릴 수 없으므로, 잠시 감추려는 것이라면 수정에서 공개를 끄는 편이 낫다.`}
                confirmLabel="삭제"
                pendingLabel="삭제 중"
                isPending={remove.isPending}
                errorMessage={remove.error?.message ?? ''}
                onConfirm={() => {
                    if (!deleteTarget) return
                    remove.mutate(deleteTarget.id, { onSuccess: closeDelete })
                }}
                onClose={closeDelete}
            />
        </div>
    )
}
