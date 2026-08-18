'use client'
// 상단 헤더 브레드크럼 — 현재 경로를 사이드바 메뉴 정의에 맞춰 표시한다

import { usePathname } from 'next/navigation'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@workspace/ui/components/breadcrumb'
import { NAV_MAIN, isNavActive } from '@/lib/nav/admin-nav'

export default function AdminBreadcrumb() {
    const pathname = usePathname()
    const current = NAV_MAIN.find((item) => isNavActive(pathname, item.url))

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbPage>{current?.title ?? '관리자'}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}
