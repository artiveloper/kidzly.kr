'use client'
// 관리자 화면 좌측 내비게이션 — 모바일에서는 상단 가로 바로 접힌다

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@workspace/ui/lib/utils'

const NAV_ITEMS = [{ href: '/', label: '대시보드' }] as const

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <nav
            aria-label="관리자 메뉴"
            className="border-border bg-card border-b md:h-dvh md:w-56 md:shrink-0 md:border-r md:border-b-0"
        >
            <div className="text-muted-foreground hidden px-5 py-5 text-sm font-semibold md:block">
                키즐리 관리자
            </div>
            <ul className="flex gap-1 overflow-x-auto px-3 py-2 md:flex-col md:px-3 md:py-0">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                    'flex h-11 items-center rounded-lg px-3 text-sm whitespace-nowrap',
                                    isActive
                                        ? 'bg-muted text-foreground font-medium'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                {item.label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
