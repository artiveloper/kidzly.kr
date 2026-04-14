import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { cn } from "@workspace/ui/lib/utils"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
})

const BASE_URL = "https://kidzly.kr"

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "키즐리 — 우리 아이 어린이집 찾기",
        template: "%s | 키즐리",
    },
    description: "지도 기반으로 내 주변 어린이집을 빠르게 찾아보세요. 어린이집 유형, 운영 시간, 서비스 정보를 한눈에 확인하세요.",
    keywords: ["어린이집", "어린이집 찾기", "어린이집 검색", "육아", "보육", "키즐리"],
    authors: [{ name: "키즐리" }],
    creator: "키즐리",
    publisher: "키즐리",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "ko_KR",
        url: BASE_URL,
        siteName: "키즐리",
        title: "키즐리 — 우리 아이 어린이집 찾기",
        description: "지도 기반으로 내 주변 어린이집을 빠르게 찾아보세요. 어린이집 유형, 운영 시간, 서비스 정보를 한눈에 확인하세요.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "키즐리 — 우리 아이 어린이집 찾기",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "키즐리 — 우리 아이 어린이집 찾기",
        description: "지도 기반으로 내 주변 어린이집을 빠르게 찾아보세요.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: BASE_URL,
    },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn("font-sans antialiased", notoSans.variable)}
    >
      <body>
        <Analytics />
        <SpeedInsights />
        <NuqsAdapter>
          <ReactQueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </ReactQueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
