'use client'
// 사이드바 하단 계정 영역 — 로그인 계정 표시와 프로필 이동·로그아웃을 제공한다

import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@workspace/ui/components/sidebar'
import { HugeiconsIcon } from '@hugeicons/react'
import { UnfoldMoreIcon, Logout01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { useSignOut } from '@/domain/admin-auth'

export function NavUser({ email }: { email: string }) {
    const { isMobile } = useSidebar()
    const { mutate, isPending } = useSignOut()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-muted text-muted-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">관리자</span>
                                <span className="truncate text-xs">{email}</span>
                            </div>
                            <HugeiconsIcon
                                icon={UnfoldMoreIcon}
                                strokeWidth={2}
                                className="ml-auto size-4"
                            />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground truncate text-xs font-normal">
                            {email}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile">
                                <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                                프로필
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={isPending} onSelect={() => mutate()}>
                            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                            로그아웃
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
