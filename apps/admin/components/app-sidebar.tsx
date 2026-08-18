'use client'
// 관리자 좌측 내비게이션 셸 — shadcn sidebar-08(inset) 블록 기반

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@workspace/ui/components/sidebar'
import logo from '@/public/logo.png'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { NAV_MAIN } from '@/lib/nav/admin-nav'

export function AppSidebar({
    email,
    ...props
}: { email: string } & React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" className="gap-3">
                                {/* 워드마크 PNG 는 위아래 여백이 넓어, 글자 크기를 맞추려면 h 를 크게 잡아야 한다 */}
                                <Image
                                    src={logo}
                                    alt="키즐리"
                                    className="h-10 w-auto"
                                    priority
                                />
                                <span className="text-muted-foreground text-base font-medium">
                                    관리자
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={NAV_MAIN} pathname={pathname} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser email={email} />
            </SidebarFooter>
        </Sidebar>
    )
}
