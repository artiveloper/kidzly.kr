'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
            <Link href="/">
                <Image src="/logo.png" alt="키즐리" width={60} height={28} priority />
            </Link>
            <Button asChild className="rounded" variant="secondary" size="sm">
                <Link href="/about">서비스 소개</Link>
            </Button>
        </header>
    );
}
