'use client'
// 관리자 계정 등록·수정 다이얼로그 — 등록은 이메일과 이름을, 수정은 이름만 받는다

import { useEffect, useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import {
    ADMIN_INITIAL_PASSWORD,
    useCreateAdminUser,
    useUpdateAdminUser,
    type AdminUser,
} from '@/domain/admin-user'

export default function AdminUserFormDialog({
    open,
    target,
    onClose,
}: {
    open: boolean
    /** null 이면 신규 등록, 값이 있으면 해당 계정 수정 */
    target: AdminUser | null
    onClose: () => void
}) {
    const isEdit = target !== null
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [localError, setLocalError] = useState('')
    const create = useCreateAdminUser()
    const update = useUpdateAdminUser()
    const isPending = create.isPending || update.isPending

    useEffect(() => {
        if (!open) return
        setEmail(target?.email ?? '')
        setName(target?.name ?? '')
        setLocalError('')
        create.reset()
        update.reset()
        // 다이얼로그가 열릴 때만 대상 계정 값으로 초기화한다
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, target])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const trimmedName = name.trim()
        if (!trimmedName) {
            setLocalError('이름을 입력하세요.')
            return
        }
        setLocalError('')

        if (isEdit) {
            update.mutate({ id: target.id, name: trimmedName }, { onSuccess: onClose })
            return
        }

        const trimmedEmail = email.trim()
        if (!trimmedEmail) {
            setLocalError('이메일을 입력하세요.')
            return
        }
        create.mutate({ email: trimmedEmail, name: trimmedName }, { onSuccess: onClose })
    }

    const message = localError || create.error?.message || update.error?.message || ''

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? '관리자 정보 수정' : '관리자 등록'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? '이메일은 변경할 수 없다. 이름만 수정한다.'
                            : `초기 비밀번호는 ${ADMIN_INITIAL_PASSWORD} 이며, 최초 로그인 시 변경해야 한다.`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} noValidate>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="admin-user-email">이메일</FieldLabel>
                            <Input
                                id="admin-user-email"
                                type="email"
                                autoComplete="off"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                disabled={isEdit || isPending}
                                readOnly={isEdit}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="admin-user-name">이름</FieldLabel>
                            <Input
                                id="admin-user-name"
                                type="text"
                                autoComplete="off"
                                required
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                aria-invalid={message ? true : undefined}
                                disabled={isPending}
                            />
                            {message ? <FieldError>{message}</FieldError> : null}
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            className="h-11"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            취소
                        </Button>
                        <Button type="submit" className="h-11" disabled={isPending}>
                            {isPending ? '저장 중' : isEdit ? '저장' : '등록'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
