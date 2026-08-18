'use client'
// admin 앱 전역 React Query 컨텍스트를 제공한다

import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { getQueryClient } from '@/lib/react-query/query-client'

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => getQueryClient())
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export { HydrationBoundary }
