'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
            <Link href="/">
                <Image src="/logo.png" alt="키즐리" width={60} height={28} priority />
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                서비스 소개
            </Link>
        </header>
    );
}
