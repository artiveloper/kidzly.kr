'use client'

import type { ReactNode } from 'react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

type Props = {
    active: boolean
    onClick: () => void
    children: ReactNode
    size?: 'sm' | 'lg'
}

export default function FilterChip({ active, onClick, children, size = 'sm' }: Props) {
    return (
        <Button
            type="button"
            size={size === 'lg' ? 'lg' : 'sm'}
            variant="outline"
            onClick={onClick}
            className={cn(
                'shrink-0 rounded-full font-semibold',
                size === 'lg' ? 'text-sm' : 'text-xs',
                active
                    ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600'
                    : 'text-gray-600 hover:border-gray-400',
            )}
        >
            {children}
        </Button>
    )
}
