'use client'
// 이메일·비밀번호 로그인 폼 — 실패는 바운더리로 던지지 않고 인라인으로 안내한다

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { NotAdminError, useSignIn } from '@/domain/admin-auth'

const INVALID_CREDENTIALS = 'Invalid login credentials'

function toMessage(error: Error): string {
    if (error instanceof NotAdminError) {
        return '관리자 권한이 없는 계정입니다.'
    }
    if (error.message === INVALID_CREDENTIALS) {
        return '이메일 또는 비밀번호가 올바르지 않습니다.'
    }
    return '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.'
}

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { mutate, isPending, error } = useSignIn()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        mutate({ email, password })
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="email">이메일</FieldLabel>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        aria-invalid={error ? true : undefined}
                        disabled={isPending}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">비밀번호</FieldLabel>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        aria-invalid={error ? true : undefined}
                        disabled={isPending}
                    />
                    {error ? <FieldError>{toMessage(error)}</FieldError> : null}
                </Field>
                <Button type="submit" className="h-11 w-full" disabled={isPending}>
                    {isPending ? '로그인 중' : '로그인'}
                </Button>
            </FieldGroup>
        </form>
    )
}
