'use client'
// 사이드바 주 메뉴

import Link from 'next/link'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@workspace/ui/components/sidebar'
import { HugeiconsIcon } from '@hugeicons/react'
import { isNavActive, type NavItem } from '@/lib/nav/admin-nav'

export function NavMain({ items, pathname }: { items: NavItem[]; pathname: string }) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>운영</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = isNavActive(pathname, item.url)
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={isActive}>
                                <Link href={item.url} aria-current={isActive ? 'page' : undefined}>
                                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
