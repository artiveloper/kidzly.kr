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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
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
