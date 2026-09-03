import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { MapPin, Trophy, BookOpen, ArrowRight, Search, ChevronDown } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { getAllPosts, getLatestPosts } from '@/lib/blog'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import HomeUpcomingDaycares from '@/components/home/HomeUpcomingDaycares'
import HomeUpcomingDaycaresSkeleton from '@/components/home/HomeUpcomingDaycaresSkeleton'

// 등록 어린이집 수는 고정값으로 표시한다 — 24,000여 행 exact count가 빌드(미국 리전)에서
// 반복 실패했고, 실패가 0으로 삼켜져 홈에 "0+"가 프리렌더된 사고가 있었다.
// 하루 1회 동기화되는 값이라 "+" 표기의 하한선으로 두는 편이 안전하다.
const DAYCARE_COUNT_LABEL = '25,000+'

const TITLE = '어린이집 찾기 | 지도 검색·랭킹·육아 정보 한곳에 - 키즐리'
const DESCRIPTION =
    '전국 2만 5천여 곳의 어린이집을 지도에서 검색하고, 국공립·민간·가정 어린이집을 지역별로 비교해 보세요. 정원·대기 현황과 지역 랭킹은 물론, 부모급여·보육료 지원과 입소 준비까지 실전 육아 정보를 한 곳에서 확인할 수 있습니다.'

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

// WebSite·Organization은 홈페이지에만 둔다 — 구글은 "WebSite 구조화 데이터가 사이트의
// 홈페이지에 있어야" 한다고 요구하며 하위 디렉터리는 지원하지 않는다
const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '키즐리',
    alternateName: 'Kidzly',
    url: 'https://kidzly.kr',
    description: DESCRIPTION,
}

const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '키즐리',
    url: 'https://kidzly.kr',
    logo: {
        '@type': 'ImageObject',
        url: 'https://kidzly.kr/favicon-512.png',
        width: 512,
        height: 512,
    },
}

// FAQ는 화면에 보이는 <details> Q&A와 FAQPage 스키마가 같은 내용을 가리켜야 한다 —
// 구글은 페이지에 실제로 노출되지 않는 FAQ 스키마를 스팸 정책 위반으로 본다
const FAQS = [
    {
        question: '키즐리는 어떤 서비스인가요?',
        answer: '키즐리는 전국 2만 5천여 곳의 어린이집을 지도에서 검색하고 비교할 수 있는 무료 서비스입니다. 국공립·민간·가정 어린이집을 지역별로 살펴보고, 정원·대기 현황과 지역 랭킹, 부모급여·입소 준비 같은 육아 정보까지 한곳에서 확인할 수 있습니다.',
    },
    {
        question: '어린이집 정보는 어디서 가져오나요?',
        answer: '모든 어린이집 정보는 정부가 운영하는 어린이집 정보공개포털(info.childcare.go.kr)의 공공 데이터를 출처로 합니다. 정원·현원·대기 현황, 교직원 구성, 보육실 면적, 통학차량 운영 여부 등을 원본 데이터 그대로 제공합니다.',
    },
    {
        question: '어린이집 정보는 얼마나 자주 갱신되나요?',
        answer: '변경된 데이터는 매일 새벽 2시(KST)에 자동으로 동기화하고, 전체 데이터는 매주 일요일 새벽 3시에 다시 동기화합니다. 그래서 최신 정원·대기 현황을 확인할 수 있습니다.',
    },
    {
        question: '어떤 조건으로 어린이집을 검색할 수 있나요?',
        answer: '지도에서 위치로 찾거나, 시·군·구 지역별 목록에서 어린이집 유형(국공립·민간·가정 등), 수용 연령, 제공 서비스 조건으로 걸러 검색할 수 있습니다. 아직 문을 열지 않은 인허가 예정 어린이집도 미리 확인할 수 있습니다.',
    },
    {
        question: '회원가입이나 이용료가 필요한가요?',
        answer: '필요하지 않습니다. 키즐리는 회원가입이나 로그인 없이 누구나 무료로 이용할 수 있습니다.',
    },
]

const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
}

export default async function Page() {
    const latestPosts = getLatestPosts(8)
    const contentCount = getAllPosts().length

    const STATS = [
        { value: DAYCARE_COUNT_LABEL, label: '등록 어린이집' },
        { value: '17개', label: '시·도 전체 커버' },
        { value: `${contentCount}+`, label: '육아 콘텐츠' },
    ]

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />
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
                        <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-2">
                            키즐리는 전국 2만 5천여 곳의 어린이집을 지도에서 검색·비교하는 무료 서비스입니다.
                        </p>
                        <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-6">
                            국공립·민간·가정 어린이집의 정원·대기 현황까지 한눈에 확인하세요.
                        </p>

                        {/* 검색은 지도 페이지(/map)의 이름·주소 검색을 그대로 재사용 — q 파라미터로 전달 */}
                        <div className="mb-3 md:flex md:items-center md:gap-3 md:max-w-2xl md:mx-auto">
                            <form action="/map" method="GET" className="relative md:flex-1">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="어린이집 이름, 주소로 검색"
                                    className="w-full h-12 md:h-14 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-base focus:border-emerald-400 focus:outline-none transition-colors"
                                />
                            </form>

                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="mt-3 md:mt-0 w-full md:w-auto h-12 md:h-14 px-6 rounded-xl border-gray-200 text-gray-700 text-base hover:bg-gray-50"
                            >
                                <Link href="/map">
                                    지도에서 찾기
                                    <ArrowRight size={16} />
                                </Link>
                            </Button>
                        </div>

                        {/* 데스크톱 전용 3열 바로가기 — SHORTCUTS 재사용.
                            폭은 아래 본문·푸터와 같은 max-w-2xl로 맞춘다 */}
                        <div className="hidden md:grid md:max-w-2xl md:mx-auto md:grid-cols-3 md:gap-4 md:mt-10 md:text-left">
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

                <div className="max-w-2xl mx-auto px-5">
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
                    <section className="py-10 md:py-14 border-b border-gray-100">
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

                    {/* 자주 묻는 질문 — 화면 노출 Q&A와 FAQPage JSON-LD가 동일 내용 */}
                    <section className="py-10 md:py-14">
                        <h2 className="text-base md:text-lg font-semibold uppercase tracking-widest text-gray-900 mb-4 md:mb-6">
                            자주 묻는 질문
                        </h2>
                        <div className="space-y-3">
                            {FAQS.map(({ question, answer }) => (
                                <details
                                    key={question}
                                    className="group rounded-xl border border-gray-100 px-4 py-3 md:px-5 md:py-4 [&_summary::-webkit-details-marker]:hidden"
                                >
                                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3">
                                        <h3 className="text-sm md:text-base font-semibold text-gray-900">
                                            {question}
                                        </h3>
                                        <ChevronDown
                                            size={18}
                                            className="shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                                            aria-hidden="true"
                                        />
                                    </summary>
                                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                        {answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
