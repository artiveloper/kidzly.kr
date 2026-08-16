import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { MapPin, Trophy, BookOpen, ArrowRight, Search } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { getAllPosts, getLatestPosts } from '@/lib/blog'
import { fetchDaycareCount } from '@/domain/daycare/server'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import HomeUpcomingDaycares from '@/components/home/HomeUpcomingDaycares'
import HomeUpcomingDaycaresSkeleton from '@/components/home/HomeUpcomingDaycaresSkeleton'

const TITLE = '어린이집 찾기 | 지도 검색·랭킹·육아 정보 한곳에 - 키즐리'
const DESCRIPTION = '전국 어린이집을 지도에서 찾고, 지역별 랭킹과 육아 정보까지 한 곳에서 확인하세요.'

export const revalidate = 3600

export const metadata: Metadata = {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: 'https://kidzly.kr' },
    openGraph: {
        type: 'website',
        locale: 'ko_KR',
        siteName: '키즐리',
        url: 'https://kidzly.kr',
        title: TITLE,
        description: DESCRIPTION,
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '어린이집 찾기 키즐리' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/og-image.png'],
    },
}

const SHORTCUTS = [
    {
        icon: MapPin,
        title: '지역별로 보기',
        description: '시·군·구 단위로 어린이집 목록을 확인하세요.',
        href: '/daycares',
    },
    {
        icon: Trophy,
        title: '어린이집 랭킹',
        description: '정원·대기·연혁 기준 순위를 지역별로 확인하세요.',
        href: '/rankings',
    },
    {
        icon: BookOpen,
        title: '육아 콘텐츠',
        description: '부모급여, 입소 준비 등 실전 가이드를 읽어보세요.',
        href: '/contents',
    },
]

export default async function Page() {
    const latestPosts = getLatestPosts(8)
    const daycareCount = await fetchDaycareCount()
    const contentCount = getAllPosts().length

    const STATS = [
        { value: `${daycareCount.toLocaleString('ko-KR')}+`, label: '등록 어린이집' },
        { value: '17개', label: '시·도 전체 커버' },
        { value: `${contentCount}+`, label: '육아 콘텐츠' },
    ]

    return (
        <div className="min-h-screen bg-white">
            <div className="daum-wm-title hidden">{TITLE}</div>
            <div className="daum-wm-content hidden">{DESCRIPTION}</div>
            <Header />

            <main className="pt-14">
                {/* 히어로 — md 이상은 데스크톱 와이드 레이아웃(검색 전체너비 + 3열 바로가기 그리드) */}
                <section className="pt-12 pb-14 md:pt-20 md:pb-20 bg-gray-50">
                    <div className="max-w-lg md:max-w-5xl mx-auto px-5 text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-3 py-1 mb-5">
                            <MapPin size={11} />
                            전국 어린이집 데이터 기반
                        </div>
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-snug mb-3">
                            내 주변 어린이집,<br />
                            <span className="text-emerald-600">지도에서 바로 찾기</span>
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-6">
                            국공립·민간·가정 어린이집을 지도로 비교하고{' '}
                            <br className="sm:hidden" />
                            대기 현황까지 확인하세요.
                        </p>

                        {/* 검색은 지도 페이지(/map)의 이름·주소 검색을 그대로 재사용 — q 파라미터로 전달 */}
                        <div className="mb-3 md:flex md:items-center md:gap-3 md:max-w-xl md:mx-auto">
                            <form action="/map" method="GET" className="relative md:flex-1">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="어린이집 이름, 주소로 검색"
                                    className="w-full h-12 md:h-14 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm md:text-base focus:border-emerald-400 focus:outline-none transition-colors"
                                />
                            </form>

                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="mt-3 md:mt-0 w-full md:w-auto md:h-14 md:px-6 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                                <Link href="/map">
                                    지도에서 찾기
                                    <ArrowRight size={13} />
                                </Link>
                            </Button>
                        </div>

                        {/* 데스크톱 전용 3열 바로가기 — SHORTCUTS 재사용 */}
                        <div className="hidden md:grid md:grid-cols-3 md:gap-4 md:mt-10 md:text-left">
                            {SHORTCUTS.map(({ icon: Icon, title, description, href }) => (
                                <Link
                                    key={title}
                                    href={href}
                                    className="flex flex-col gap-3 p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-md transition-all"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
                                        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="max-w-lg md:max-w-5xl mx-auto px-5">
                    {/* 통계 */}
                    <section className="py-10 md:py-14 border-b border-gray-100">
                        <div className="grid grid-cols-3 gap-3 md:gap-8">
                            {STATS.map(({ value, label }) => (
                                <div key={label} className="text-center">
                                    <p className="text-lg md:text-3xl font-bold text-gray-900">{value}</p>
                                    <p className="text-xs md:text-sm text-gray-400 mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 바로가기 — 데스크톱은 히어로 3열 그리드가 대체 */}
                    <section className="py-10 border-b border-gray-100 md:hidden">
                        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                            바로가기
                        </h2>
                        <div className="space-y-3">
                            {SHORTCUTS.map(({ icon: Icon, title, description, href }) => (
                                <Link
                                    key={title}
                                    href={href}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm active:bg-gray-50 transition-all"
                                >
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Icon size={19} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900">{title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                                    </div>
                                    <ArrowRight size={15} className="shrink-0 text-gray-300" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* 인허가 예정 — 전국 기준 8개, 지역별 상세는 /daycares?tab=upcoming에서 확인 */}
                    <section className="py-10 md:py-14 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h2 className="text-base md:text-lg font-semibold uppercase tracking-widest text-gray-900">
                                인허가 예정
                            </h2>
                            <Link href="/daycares?tab=upcoming" className="text-xs md:text-sm font-semibold text-gray-400">
                                지역별로 보기
                            </Link>
                        </div>
                        <Suspense fallback={<HomeUpcomingDaycaresSkeleton />}>
                            <HomeUpcomingDaycares />
                        </Suspense>
                    </section>

                    {/* 최신 콘텐츠 */}
                    <section className="py-10 md:py-14 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h2 className="text-base md:text-lg font-semibold uppercase tracking-widest text-gray-900">
                                최신 콘텐츠
                            </h2>
                            <Link href="/contents" className="text-xs md:text-sm font-semibold text-gray-400">
                                전체 보기
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {latestPosts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/contents/${post.slug}`}
                                    className="flex items-center gap-3 p-3 md:p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm active:bg-gray-50 transition-all"
                                >
                                    <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                                        {post.thumbnail ? (
                                            <Image
                                                src={post.thumbnail}
                                                alt={post.title}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                                                <BookOpen size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm md:text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                                        {post.title}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* 신뢰 */}
                    <section className="py-10 md:py-14">
                        <div className="p-4 md:p-8 bg-emerald-50 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                            <p className="text-sm md:text-base text-gray-700">
                                모든 어린이집 정보는 정부 공공 데이터(어린이집 정보공개포털)를 기반으로 매일 자동 동기화됩니다.
                            </p>
                            <Link
                                href="/about"
                                className="shrink-0 text-sm md:text-base font-semibold text-emerald-600 inline-flex items-center gap-1"
                            >
                                서비스 소개 더 보기
                                <ArrowRight size={13} />
                            </Link>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
