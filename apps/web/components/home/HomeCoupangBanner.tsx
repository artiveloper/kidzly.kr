'use client'
// 홈 화면 쿠팡 파트너스 다이나믹 배너 — 뷰포트에 맞는 크기(PC 632 / MO 320) 하나만 렌더링한다

import { useSyncExternalStore } from 'react'

const BANNER_SRC = 'https://ads-partners.coupang.com/widgets.html?id=1042440&template=carousel&trackingCode=AF9504405&subId=&tsource='
const BANNER_HEIGHT = 140
const DESKTOP_QUERY = '(min-width: 768px)'

function subscribe(onChange: () => void) {
    const mql = window.matchMedia(DESKTOP_QUERY)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
}

// 서버에서는 뷰포트를 알 수 없어 null — 높이만 잡아 두고 iframe은 클라이언트에서 그린다.
// CSS로 두 개를 숨겨 두면 숨긴 iframe도 로드돼 노출이 두 번 잡히므로 하나만 렌더링한다
export default function HomeCoupangBanner() {
    const isDesktop = useSyncExternalStore(
        subscribe,
        () => window.matchMedia(DESKTOP_QUERY).matches,
        () => null,
    )
    const width = isDesktop ? 632 : 320

    return (
        <section className="py-10 md:py-14 border-b border-gray-100" aria-label="쿠팡 추천 상품">
            <div className="flex justify-center" style={{ height: BANNER_HEIGHT }}>
                {isDesktop !== null && (
                    <iframe
                        key={width}
                        src={`${BANNER_SRC}&width=${width}&height=${BANNER_HEIGHT}`}
                        width={width}
                        height={BANNER_HEIGHT}
                        title="쿠팡 추천 상품"
                        loading="lazy"
                        scrolling="no"
                        referrerPolicy="unsafe-url"
                        className="border-0"
                    />
                )}
            </div>
            <p className="mt-3 text-center text-xs text-gray-500">
                이 페이지는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </section>
    )
}
