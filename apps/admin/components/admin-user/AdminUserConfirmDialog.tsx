'use client'
// 비밀번호 초기화·계정 삭제처럼 되돌리기 어려운 동작을 확인받는 다이얼로그

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'

export default function AdminUserConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    pendingLabel,
    isPending,
    errorMessage,
    onConfirm,
    onClose,
}: {
    open: boolean
    title: string
    description: string
    confirmLabel: string
    pendingLabel: string
    isPending: boolean
    errorMessage: string
    onConfirm: () => void
    onClose: () => void
}) {
    return (
        <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                {errorMessage ? (
                    <p className="text-destructive text-sm" role="alert">
                        {errorMessage}
                    </p>
                ) : null}

                <AlertDialogFooter>
                    <AlertDialogCancel variant="secondary" className="h-11" disabled={isPending}>
                        취소
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="h-11"
                        disabled={isPending}
                        // 실패하면 다이얼로그를 닫지 않고 오류를 그대로 보여준다
                        onClick={(event) => {
                            event.preventDefault()
                            onConfirm()
                        }}
                    >
                        {isPending ? pendingLabel : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
