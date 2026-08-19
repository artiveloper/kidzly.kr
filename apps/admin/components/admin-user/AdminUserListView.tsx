'use client'
// 관리자 계정 관리 화면 — 등록 버튼과 전체 목록 표를 배치한다

import { Suspense, useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { UserAdd01Icon } from '@hugeicons/core-free-icons'
import AdminUserFormDialog from '@/components/admin-user/AdminUserFormDialog'
import AdminUserTable from '@/components/admin-user/AdminUserTable'
import AdminUserTableSkeleton from '@/components/admin-user/AdminUserTableSkeleton'

export default function AdminUserListView({ currentUserId }: { currentUserId: string }) {
    const [createOpen, setCreateOpen] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button type="button" className="h-11" onClick={() => setCreateOpen(true)}>
                    <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} className="size-4" />
                    관리자 등록
                </Button>
            </div>

            <Suspense fallback={<AdminUserTableSkeleton />}>
                <AdminUserTable currentUserId={currentUserId} />
            </Suspense>

            <AdminUserFormDialog
                open={createOpen}
                target={null}
                onClose={() => setCreateOpen(false)}
            />
        </div>
    )
}
