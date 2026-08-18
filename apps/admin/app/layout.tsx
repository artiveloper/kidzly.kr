// admin 앱 루트 레이아웃 — 전역 스타일·폰트·React Query 컨텍스트를 세팅한다
import type { Metadata, Viewport } from 'next'
import '@workspace/ui/globals.css'
import ReactQueryProvider from '@/components/providers/ReactQueryProvider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const FONT_STACK =
    'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'

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
        <html
            lang="ko"
            className="font-sans antialiased"
            style={{ '--font-sans': FONT_STACK } as React.CSSProperties}
        >
            <body className="bg-background text-foreground min-h-dvh">
                <NuqsAdapter>
                    <ReactQueryProvider>{children}</ReactQueryProvider>
                </NuqsAdapter>
            </body>
        </html>
    )
}
