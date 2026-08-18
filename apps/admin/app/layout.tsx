// admin 앱 루트 레이아웃 — 전역 스타일·폰트·React Query 컨텍스트를 세팅한다
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import '@workspace/ui/globals.css'
import { cn } from '@workspace/ui/lib/utils'
import ReactQueryProvider from '@/components/providers/ReactQueryProvider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const pretendard = localFont({
    src: '../public/fonts/PretendardVariable.woff2',
    variable: '--font-sans',
    display: 'swap',
    weight: '45 920',
})

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export const metadata: Metadata = {
    title: {
        default: '키즐리 관리자',
        template: '%s | 키즐리 관리자',
    },
    description: '키즐리 운영자용 관리 도구',
    robots: {
        index: false,
        follow: false,
    },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ko" className={cn('font-sans antialiased', pretendard.variable)}>
            <body className="bg-background text-foreground min-h-dvh">
                <NuqsAdapter>
                    <ReactQueryProvider>{children}</ReactQueryProvider>
                </NuqsAdapter>
            </body>
        </html>
    )
}
