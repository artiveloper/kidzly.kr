'use client'
// 놀거리 등록·수정 다이얼로그 — 등록과 수정이 같은 필드를 쓰고 제출 대상만 다르다

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
import { useCreatePlace, useUpdatePlace, type Place } from '@/domain/place'
import PlaceFormFields from './PlaceFormFields'
import {
    createEmptyFormState,
    toFormState,
    validateFormState,
    type PlaceFormState,
} from './place-form-state'

export default function PlaceFormDialog({
    open,
    target,
    onClose,
}: {
    open: boolean
    /** null 이면 신규 등록, 값이 있으면 해당 놀거리 수정 */
    target: Place | null
    onClose: () => void
}) {
    const isEdit = target !== null
    const [state, setState] = useState<PlaceFormState>(createEmptyFormState)
    const [localError, setLocalError] = useState('')
    const create = useCreatePlace()
    const update = useUpdatePlace()
    const isPending = create.isPending || update.isPending

    useEffect(() => {
        if (!open) return
        setState(target ? toFormState(target) : createEmptyFormState())
        setLocalError('')
        create.reset()
        update.reset()
        // 다이얼로그가 열릴 때만 대상 값으로 초기화한다
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, target])

    const handleChange = <K extends keyof PlaceFormState>(key: K, value: PlaceFormState[K]) => {
        setState((prev) => ({ ...prev, [key]: value }))
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const result = validateFormState(state)
        if (!result.ok) {
            setLocalError(result.message)
            return
        }
        setLocalError('')

        if (isEdit) {
            update.mutate({ id: target.id, ...result.input }, { onSuccess: onClose })
            return
        }
        create.mutate(result.input, { onSuccess: onClose })
    }

    const message = localError || create.error?.message || update.error?.message || ''

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? '놀거리 수정' : '놀거리 등록'}</DialogTitle>
                    <DialogDescription>
                        요금·시설 정보는 6개월이면 절반쯤 틀려진다. 최종 확인일을 반드시 갱신한다.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} noValidate>
                    <PlaceFormFields state={state} disabled={isPending} onChange={handleChange} />

                    {message ? (
                        <p className="text-destructive mt-4 text-sm" role="alert">
                            {message}
                        </p>
                    ) : null}

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
