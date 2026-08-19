'use client'
// 현재 비밀번호를 확인한 뒤 새 비밀번호로 바꾸는 폼 — 프로필과 최초 로그인 강제 변경 화면이 함께 쓴다

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { InvalidCurrentPasswordError, useChangePassword } from '@/domain/admin-auth'
import { ADMIN_PASSWORD_MIN_LENGTH } from '@/domain/admin-user'

const SAME_PASSWORD = 'New password should be different from the old password.'

function toMessage(error: Error): string {
    if (error instanceof InvalidCurrentPasswordError) {
        return '현재 비밀번호가 올바르지 않습니다.'
    }
    if (error.message === SAME_PASSWORD) {
        return '새 비밀번호는 기존 비밀번호와 달라야 합니다.'
    }
    return '비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

export default function PasswordChangeForm({
    submitLabel = '비밀번호 변경',
    onSuccess,
}: {
    submitLabel?: string
    onSuccess?: () => void
}) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [localError, setLocalError] = useState('')
    const [done, setDone] = useState(false)
    const { mutate, isPending, error } = useChangePassword()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setDone(false)

        if (newPassword.length < ADMIN_PASSWORD_MIN_LENGTH) {
            setLocalError(`새 비밀번호는 ${ADMIN_PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`)
            return
        }
        if (newPassword !== confirmPassword) {
            setLocalError('새 비밀번호가 서로 일치하지 않습니다.')
            return
        }

        setLocalError('')
        mutate(
            { currentPassword, newPassword },
            {
                onSuccess: () => {
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setDone(true)
                    onSuccess?.()
                },
            }
        )
    }

    const message = localError || (error ? toMessage(error) : '')

    return (
        <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="current-password">현재 비밀번호</FieldLabel>
                    <Input
                        id="current-password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        disabled={isPending}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="new-password">새 비밀번호</FieldLabel>
                    <Input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={ADMIN_PASSWORD_MIN_LENGTH}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        disabled={isPending}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="confirm-password">새 비밀번호 확인</FieldLabel>
                    <Input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        aria-invalid={message ? true : undefined}
                        disabled={isPending}
                    />
                    {message ? <FieldError>{message}</FieldError> : null}
                    {done && !message ? (
                        <p className="text-sm text-emerald-600" role="status">
                            비밀번호를 변경했습니다.
                        </p>
                    ) : null}
                </Field>
                <Button type="submit" className="h-11 w-full" disabled={isPending}>
                    {isPending ? '변경 중' : submitLabel}
                </Button>
            </FieldGroup>
        </form>
    )
}
