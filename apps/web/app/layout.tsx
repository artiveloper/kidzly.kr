import type { Metadata, Viewport } from "next"
import Script from "next/script"
import "@workspace/ui/globals.css"
import "./fonts.css"
import ThemeProvider from "@/components/theme-provider"
import ReactQueryProvider from "@/components/providers/ReactQueryProvider"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { GoogleAnalytics } from "@next/third-parties/google"

const BASE_URL = "https://kidzly.kr"

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    interactiveWidget: "resizes-visual",
    viewportFit: "cover",
}

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "어린이집 찾기 | 내 주변 국공립 어린이집 한눈에 비교 - 키즐리",
        template: "%s | 어린이집 검색 - 키즐리",
    },
    description:
        "지도 기반으로 내 주변 어린이집을 빠르게 찾아보세요. 국공립·민간·가정 어린이집 비교 및 운영시간·대기 현황 확인 가능",
    authors: [{ name: "키즐리" }],
    creator: "키즐리",
    publisher: "키즐리",
    // index·follow는 기본값이라 명시해도 효과가 없다 — 실제로 동작하는 지시어만 남긴다
    robots: {
        googleBot: {
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "ko_KR",
        url: BASE_URL,
        siteName: "키즐리",
        title: "어린이집 찾기 | 내 주변 국공립 어린이집 한눈에 비교 - 키즐리",
        description:
            "지도 기반으로 내 주변 어린이집을 빠르게 찾아보세요. 국공립·민간·가정 어린이집 비교 및 운영시간·대기 현황 확인 가능",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "어린이집 찾기 키즐리",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "어린이집 찾기 | 키즐리",
        description: "지도 기반으로 내 주변 어린이집을 빠르게 찾아보세요. 국공립·민간·가정 어린이집 비교 및 운영시간·대기 현황 확인 가능",
        images: ["/og-image.png"],
    },
    // canonical은 각 page.tsx에서만 지정한다 — 루트에 두면 canonical을 빠뜨린 신규 라우트가
    // 조용히 홈으로 canonical 되어 색인에서 빠진다
    verification: {
        other: {
            "naver-site-verification": "259e0ccfc1c2b8e2e7dc0cef278a80e00f4a3f51"
        },
    },
}

export default function RootLayout({
    children,
    modal,
}: Readonly<{
    children: React.ReactNode
    modal: React.ReactNode
}>) {
    return (
        <html
            lang="ko"
            suppressHydrationWarning
            className="font-sans antialiased"
        >
            <head>
                {/* 광고 스크립트는 유휴 시점에 뜨므로 이름 해석만 미리 해둔다 */}
                <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
                {/* GA4는 하이드레이션 직후 뜨므로 연결까지 미리 맺는다 */}
                <link rel="preconnect" href="https://www.googletagmanager.com" />
            </head>
            <body>
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6240197797349980"
                    crossOrigin="anonymous"
                    strategy="lazyOnload"
                />
                <GoogleAnalytics gaId="G-9CKKGKLVLC" />
                <NuqsAdapter>
                    <ReactQueryProvider>
                        <ThemeProvider>
                            {children}
                            {modal}
                        </ThemeProvider>
                    </ReactQueryProvider>
                </NuqsAdapter>
            </body>
        </html>
    )
}
