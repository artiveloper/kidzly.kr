'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@workspace/ui/components/sheet';

const NAV_LINKS = [
    { href: '/map', label: '지도' },
    { href: '/daycares', label: '어린이집 찾기' },
    { href: '/rankings', label: '랭킹' },
    { href: '/contents', label: '콘텐츠' },
    { href: '/about', label: '서비스 소개' },
];

export default function Header() {
    const pathname = usePathname();

    const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 grid grid-cols-3 items-center px-4">
            <Link href="/" className="justify-self-start">
                <Image src="/logo.png" alt="키즐리" width={80} height={34} priority />
            </Link>

            <div className="hidden items-center gap-2 justify-self-center sm:flex">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className={
                        isActive('/map')
                            ? 'text-gray-900 font-bold underline underline-offset-4'
                            : 'text-gray-600 font-semibold'
                    }
                >
                    <Link href="/map">지도</Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className={
                        isActive('/daycares')
                            ? 'text-gray-900 font-bold underline underline-offset-4'
                            : 'text-gray-600 font-semibold'
                    }
                >
                    <Link href="/daycares">어린이집 찾기</Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className={
                        isActive('/rankings')
                            ? 'text-gray-900 font-bold underline underline-offset-4'
                            : 'text-gray-600 font-semibold'
                    }
                >
                    <Link href="/rankings">랭킹</Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className={
                        isActive('/contents')
                            ? 'text-gray-900 font-bold underline underline-offset-4'
                            : 'text-gray-600 font-semibold'
                    }
                >
                    <Link href="/contents">콘텐츠</Link>
                </Button>
            </div>

            <div className="col-start-3 flex items-center justify-end gap-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-11 sm:hidden" aria-label="메뉴 열기">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full! max-w-full!">
                        <SheetHeader>
                            <SheetTitle asChild>
                                <span>
                                    <Image src="/logo.png" alt="키즐리" width={80} height={34} priority />
                                </span>
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-1 px-4 pb-4">
                            {NAV_LINKS.map(({ href, label }) => (
                                <SheetClose key={href} asChild>
                                    <Link
                                        href={href}
                                        className={
                                            isActive(href)
                                                ? 'rounded-lg px-3 py-3 text-base font-bold text-gray-900 underline underline-offset-4 hover:bg-gray-50'
                                                : 'rounded-lg px-3 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50'
                                        }
                                    >
                                        {label}
                                    </Link>
                                </SheetClose>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
