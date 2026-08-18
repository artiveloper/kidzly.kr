// 관리자 사이드바 메뉴 정의 — 사이드바와 헤더 브레드크럼이 같은 소스를 공유한다
import { Baby01Icon, DashboardSquare01Icon, MapsLocation01Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

export type NavItem = {
    title: string
    url: string
    icon: IconSvgElement
}

export const NAV_MAIN: NavItem[] = [
    {
        title: '대시보드',
        url: '/',
        icon: DashboardSquare01Icon,
    },
    {
        title: '어린이집 관리',
        url: '/daycares',
        icon: Baby01Icon,
    },
    {
        title: '놀이시설 관리',
        url: '/playgrounds',
        icon: MapsLocation01Icon,
    },
]

/** `/playgrounds/1741` 처럼 하위 경로에 있어도 상위 메뉴를 활성으로 본다. */
export function isNavActive(pathname: string, url: string): boolean {
    if (url === '/') return pathname === '/'
    return pathname === url || pathname.startsWith(`${url}/`)
}
