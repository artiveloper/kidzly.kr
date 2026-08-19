// GA4 스크립트를 브라우저 유휴 시점까지 미뤄 초기 메인스레드 점유를 줄이는 래퍼
'use client'

import { useEffect, useState } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'

const GA_ID = 'G-9CKKGKLVLC'

// requestIdleCallback 미지원 브라우저(Safari 구버전)를 위한 지연 시간
const FALLBACK_DELAY_MS = 3000

export default function DeferredAnalytics() {
    const [ready, setReady] = useState(false)

    useEffect(() => {
        // GoogleAnalytics가 렌더돼야 sendGAEvent가 동작한다.
        // 공유 버튼은 사용자 인터랙션으로만 실행되므로 유휴 마운트보다 항상 늦다
        if (typeof window.requestIdleCallback === 'function') {
            const handle = window.requestIdleCallback(() => setReady(true), { timeout: FALLBACK_DELAY_MS })
            return () => window.cancelIdleCallback(handle)
        }

        const timer = window.setTimeout(() => setReady(true), FALLBACK_DELAY_MS)
        return () => window.clearTimeout(timer)
    }, [])

    if (!ready) return null

    return <GoogleAnalytics gaId={GA_ID} />
}
