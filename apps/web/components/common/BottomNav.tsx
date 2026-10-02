'use client';

// 모바일(sm 미만) 화면 하단에 고정되는 주 메뉴 탭 바
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, List, Map as MapIcon, Trophy } from 'lucide-react';

const TABS = [
    { href: '/map', label: '지도', Icon: MapIcon },
    { href: '/daycares', label: '목록', Icon: List },
    { href: '/rankings', label: '랭킹', Icon: Trophy },
    { href: '/contents', label: '콘텐츠', Icon: BookOpen },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="주 메뉴"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
        >
            <ul className="grid h-14 grid-cols-4">
                {TABS.map(({ href, label, Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] ${
                                    active ? 'font-bold text-gray-900' : 'font-medium text-gray-500'
                                }`}
                            >
                                <Icon size={22} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
