'use client'
// 관리자 계정 목록 표와 행별 동작(수정·비밀번호 초기화·삭제)

import { useState } from 'react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@workspace/ui/components/empty'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { HugeiconsIcon } from '@hugeicons/react'
import { MoreVerticalIcon } from '@hugeicons/core-free-icons'
import {
    ADMIN_INITIAL_PASSWORD,
    useAdminUserList,
    useDeleteAdminUser,
    useResetAdminUserPassword,
    type AdminUser,
} from '@/domain/admin-user'
import { formatUtcDateTime } from '@/lib/format'
import AdminUserConfirmDialog from '@/components/admin-user/AdminUserConfirmDialog'
import AdminUserFormDialog from '@/components/admin-user/AdminUserFormDialog'

export default function AdminUserTable({ currentUserId }: { currentUserId: string }) {
    const { data: items } = useAdminUserList()
    const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
    const [resetTarget, setResetTarget] = useState<AdminUser | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
    const resetPassword = useResetAdminUserPassword()
    const remove = useDeleteAdminUser()

    if (items.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>등록된 관리자가 없습니다</EmptyTitle>
                    <EmptyDescription>
                        위의 관리자 등록 버튼으로 첫 계정을 만드세요.
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
                                이름 · {items.length.toLocaleString('ko-KR')}명
                            </TableHead>
                            <TableHead className="whitespace-nowrap">이메일</TableHead>
                            <TableHead className="whitespace-nowrap">상태</TableHead>
                            <TableHead className="whitespace-nowrap">마지막 로그인</TableHead>
                            <TableHead className="w-12">
                                <span className="sr-only">관리</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium whitespace-nowrap">
                                    {item.name || '-'}
                                    {item.id === currentUserId ? (
                                        <span className="text-muted-foreground ml-1 text-xs">
                                            (나)
                                        </span>
                                    ) : null}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {item.email}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {item.mustChangePassword ? (
                                        <Badge variant="secondary">초기 비밀번호</Badge>
                                    ) : (
                                        <Badge variant="outline">사용 중</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                    {formatUtcDateTime(item.lastSignInAt)}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-11"
                                            >
                                                <HugeiconsIcon
                                                    icon={MoreVerticalIcon}
                                                    strokeWidth={2}
                                                    className="size-4"
                                                />
                                                <span className="sr-only">
                                                    {item.email} 계정 관리
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => setEditTarget(item)}>
                                                정보 수정
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setResetTarget(item)}>
                                                비밀번호 초기화
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                variant="destructive"
                                                disabled={item.id === currentUserId}
                                                onSelect={() => setDeleteTarget(item)}
                                            >
                                                계정 삭제
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AdminUserFormDialog
                open={editTarget !== null}
                target={editTarget}
                onClose={() => setEditTarget(null)}
            />

            <AdminUserConfirmDialog
                open={resetTarget !== null}
                title="비밀번호를 초기화할까요?"
                description={`${resetTarget?.email ?? ''} 계정의 비밀번호가 ${ADMIN_INITIAL_PASSWORD} 로 바뀌고, 다음 로그인에서 새 비밀번호를 설정하게 됩니다.`}
                confirmLabel="초기화"
                pendingLabel="초기화 중"
                isPending={resetPassword.isPending}
                errorMessage={resetPassword.error?.message ?? ''}
                onConfirm={() => {
                    if (!resetTarget) return
                    resetPassword.mutate(resetTarget.id, {
                        onSuccess: () => setResetTarget(null),
                    })
                }}
                onClose={() => {
                    resetPassword.reset()
                    setResetTarget(null)
                }}
            />

            <AdminUserConfirmDialog
                open={deleteTarget !== null}
                title="계정을 삭제할까요?"
                description={`${deleteTarget?.email ?? ''} 계정을 삭제합니다. 되돌릴 수 없습니다.`}
                confirmLabel="삭제"
                pendingLabel="삭제 중"
                isPending={remove.isPending}
                errorMessage={remove.error?.message ?? ''}
                onConfirm={() => {
                    if (!deleteTarget) return
                    remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
                }}
                onClose={() => {
                    remove.reset()
                    setDeleteTarget(null)
                }}
            />
        </div>
    )
}
