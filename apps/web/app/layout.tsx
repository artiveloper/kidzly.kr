import type { Metadata, Viewport } from "next"
import { Noto_Sans_KR } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { cn } from "@workspace/ui/lib/utils"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GoogleAnalytics } from "@next/third-parties/google"

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
})

const BASE_URL = "https://kidzly.kr"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-visual",
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "어린이집 찾기 | 내 주변 국공립 어린이집 한눈에 비교 - 키즐리",
    template: "%s | 어린이집 검색 - 키즐리",
  },
  description:
    "지도 기반으로 내 주변 어린이집을 빠르게 찾아보세요. 국공립·민간·가정 어린이집 비교 및 운영시간·대기 현황 확인 가능",
  keywords: [
    "어린이집 찾기",
    "어린이집 검색",
    "국공립 어린이집",
    "민간 어린이집",
    "가정 어린이집",
    "어린이집 비교",
    "서울 어린이집",
    "어린이집 추천",
    "어린이집 위치",
    "어린이집 대기",
    "보육시설 검색",
    "유치원 어린이집 차이",
    "전국 어린이집 정보",
    "어린이집 지도",
    "입소 대기",
    "어린이집 대기",
    "어린이집 대기신청",
    "어린이집 대기현황",
    "국공립 어린이집 대기",
    "입소대기 신청",
    "임신육아종합포털",
    "임신육아종합포털 아이사랑",
    "아이사랑",
  ],
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
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    other: {
      "naver-site-verification": "259e0ccfc1c2b8e2e7dc0cef278a80e00f4a3f51",
    },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "키즐리",
  url: BASE_URL,
  description:
    "지도 기반으로 내 주변 어린이집을 빠르게 찾아보세요. 국공립·민간·가정 어린이집 비교 및 운영시간·대기 현황 확인 가능",
  publisher: {
    "@type": "Organization",
    name: "키즐리",
    url: BASE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
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
      className={cn("font-sans antialiased", notoSans.variable)}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
        <SpeedInsights />
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
