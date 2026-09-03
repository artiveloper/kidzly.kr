// /daycares 라우트 계열(지역별·인허가예정)이 공유하는 페이지 골격 — 제목·탭 바·본문 컨테이너
import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

// 두 탭 모두 자기 경로를 가진다 — 인허가예정은 지역과 무관한 전국 화면이라 지역 세그먼트를 두지 않는다
const TABS = [
    { key: 'region', label: '지역별', href: '/daycares' },
    { key: 'upcoming', label: '인허가예정', href: '/daycares/upcoming' },
] as const

export type DaycaresTab = (typeof TABS)[number]['key']

type Props = {
    activeTab: DaycaresTab
    heading: string
    description: string
    /** 구조화 데이터·다음 웹마스터도구용 숨김 마크업 — 기존 DOM 위치를 지키려고 최상단에 둔다 */
    seo: ReactNode
    children: ReactNode
}

export default function DaycaresShell({ activeTab, heading, description, seo, children }: Props) {
    return (
        <div className="min-h-screen bg-white">
            {seo}
            <Header />

            <main className="pt-14">
                <div className="bg-white border-b border-gray-100">
                    <div className="mx-auto max-w-2xl px-4 pt-7 pb-6">
                        <h1 className="mb-1 text-xl font-bold text-gray-900">{heading}</h1>
                        <p className="text-sm text-gray-400">{description}</p>
                    </div>
                </div>

                <div className="mx-auto max-w-2xl px-4 flex gap-1">
                    {TABS.map((tab) => (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            aria-current={activeTab === tab.key ? 'page' : undefined}
                            className={cn(
                                'px-4 py-2.5 text-base md:text-lg font-bold border-b-2 transition-colors',
                                activeTab === tab.key
                                    ? 'border-emerald-600 text-emerald-700'
                                    : 'border-transparent text-gray-400 hover:text-gray-600',
                            )}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>

                <div className="mx-auto max-w-2xl px-4 pt-6 pb-12">{children}</div>
            </main>

            <Footer />
        </div>
    )
}
