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
                    {/* 확인 버튼은 스스로 닫지 않는다. 실패하면 열어둔 채 오류를 보여주고,
                        성공했을 때만 호출자가 onClose 로 닫는다 */}
                    <AlertDialogAction
                        className="h-11"
                        disabled={isPending}
                        onClick={onConfirm}
                    >
                        {isPending ? pendingLabel : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
