import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { MapPin, SlidersHorizontal, LayoutList, Smartphone, ArrowRight, X, Check, MoveRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

const DESCRIPTION =
    "아이를 낳고 어린이집을 찾다가 너무 불편해서 직접 만들었습니다. 지도 기반으로 내 주변 어린이집을 빠르게 찾고, 유형·운영시간·대기 현황까지 한눈에 비교하세요."

export const metadata: Metadata = {
    title: "서비스 소개",
    description: DESCRIPTION,
    openGraph: {
        type: "website",
        locale: "ko_KR",
        siteName: "키즐리",
        title: "서비스 소개 | 키즐리",
        description: DESCRIPTION,
        url: "https://kidzly.kr/about",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "키즐리 서비스 소개" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "서비스 소개 | 키즐리",
        description: DESCRIPTION,
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://kidzly.kr/about",
    },
}

const PAIN_POINTS = [
    "원하는 조건으로 검색하기 어렵다",
    "정원·대기 등 핵심 정보가 흩어져 있어 비교가 힘들다",
    "UI가 복잡하고 직관적이지 않다",
    "모바일에서 사용하기 불편하다",
]

const FEATURES = [
    {
        icon: MapPin,
        title: "지도 기반 빠른 탐색",
        description:
            "내 주변 어린이집을 지도 위에서 바로 확인할 수 있습니다. 주소를 일일이 입력할 필요 없이, 지도를 움직이는 것만으로 원하는 지역을 탐색할 수 있습니다.",
    },
    {
        icon: SlidersHorizontal,
        title: "조건별 필터 검색",
        description:
            "어린이집 유형(국공립·민간·가정 등), 수용 연령, 제공 서비스를 원하는 조건으로 필터링할 수 있습니다. 내 아이에게 맞는 곳만 골라볼 수 있습니다.",
    },
    {
        icon: LayoutList,
        title: "핵심 정보 한눈에 비교",
        description:
            "정원·현원·대기 현황, 교직원 구성, 보육실 면적, 통학차량 운영 여부까지 한 화면에서 확인할 수 있습니다. 여러 탭을 오가며 정보를 조각 맞출 필요가 없습니다.",
    },
    {
        icon: Smartphone,
        title: "모바일 최적화 UI",
        description:
            "외출 중에도 손가락 하나로 빠르게 탐색할 수 있도록 설계했습니다. 복잡한 구조 없이 필요한 정보에 바로 접근할 수 있는 가볍고 직관적인 인터페이스입니다.",
    },
]

const TARGET_AUDIENCES = [
    "처음 어린이집을 알아보기 시작한 부모님",
    "여러 어린이집을 나란히 비교하고 싶은 분",
    "이동 중에 빠르게 주변 어린이집을 찾고 싶은 분",
    "대기 현황을 포함해 세부 정보까지 꼼꼼히 보고 싶은 분",
]

const ROADMAP = [
    "더 정확하고 최신화된 정보 제공",
    "사용자 조건 기반 맞춤 추천 기능",
    "실제 이용 후기 및 평가 시스템",
    "데이터 기반 어린이집 비교 기능 강화",
]

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "서비스 소개 | 키즐리",
    description: DESCRIPTION,
    url: "https://kidzly.kr/about",
    publisher: {
        "@type": "Organization",
        name: "키즐리",
        url: "https://kidzly.kr",
    },
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4">
                <Link href="/">
                    <Image src="/logo.png" alt="키즐리" width={60} height={28} priority />
                </Link>
            </header>

            <main className="pt-14">
                {/* Hero */}
                <section className="pt-12 pb-14 bg-emerald-50">
                    <div className="max-w-lg mx-auto px-5">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1 mb-5">
                            <MapPin size={11} />
                            지도 기반 어린이집 검색
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
                            내 주변 어린이집,<br />
                            <span className="text-emerald-600">한눈에 찾고 바로 비교</span>
                        </h1>
                        <p className="text-sm text-gray-500 leading-relaxed mb-8">
                            어린이집 유형, 운영 시간, 대기 현황 등<br className="sm:hidden" />
                            꼭 필요한 정보를 한 화면에서 확인할 수 있습니다.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white"
                        >
                            <Link href="/">
                                어린이집 찾아보기
                                <ArrowRight size={15} />
                            </Link>
                        </Button>
                    </div>
                </section>

                <div className="max-w-lg mx-auto px-5">
                    {/* 만들게 된 이야기 */}
                    <section className="py-10 border-b border-gray-100">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                            만들게 된 이야기
                        </p>
                        <h2 className="text-lg font-bold text-gray-900 mb-5">
                            아이를 낳고 직접 겪었습니다
                        </h2>

                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed mb-7">
                            <p>
                                아이가 태어나고 어린이집을 알아보기 시작했습니다.
                                지도를 켜고, 검색창을 열고, 여러 탭을 오가며 정보를 하나씩 모았습니다.
                            </p>
                            <p>
                                그런데 생각보다 너무 불편했습니다.
                                원하는 조건으로 검색하기도 어렵고, 정원이나 대기 현황 같은
                                핵심 정보를 찾으려면 여러 페이지를 뒤져야 했습니다.
                                모바일에서는 더 불편했고요.
                            </p>
                            <p className="font-medium text-gray-800">
                                "이 정도면 내가 만드는 게 낫겠다."
                            </p>
                            <p>
                                개발자라면 한번쯤 해봤을 생각을, 이번에는 그냥 넘기지 않았습니다.
                                같은 불편함을 겪고 있는 부모님들이 좀 더 쉽게 어린이집을
                                찾을 수 있으면 좋겠다는 마음으로 키즐리를 만들었습니다.
                            </p>
                        </div>

                        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                            불편했던 것들
                        </p>
                        <ul className="space-y-3 mb-7">
                            {PAIN_POINTS.map((point) => (
                                <li key={point} className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 w-[18px] h-[18px] rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                                        <X size={10} className="text-red-400" />
                                    </span>
                                    <span className="text-sm text-gray-700">{point}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-start gap-2.5 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <MoveRight size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-900">
                                    그래서 키즐리를 만들었습니다.
                                </p>
                                <p className="text-sm text-emerald-700 mt-0.5 leading-relaxed">
                                    부모 입장에서 진짜 편한 어린이집 검색 서비스를 직접 만들기로 했습니다.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 핵심 기능 */}
                    <section className="py-10 border-b border-gray-100">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                            핵심 기능
                        </p>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">
                            불편했던 것들을 하나씩 해결했습니다
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-7">
                            직접 겪은 불편함을 바탕으로, 꼭 필요한 기능만 담았습니다.
                        </p>
                        <div className="space-y-7">
                            {FEATURES.map(({ icon: Icon, title, description }, index) => (
                                <div key={title} className="flex gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mt-0.5">
                                        <Icon size={19} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[11px] font-bold text-emerald-500 tabular-nums">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 추천 대상 */}
                    <section className="py-10 border-b border-gray-100">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                            이런 분들에게
                        </p>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">
                            저처럼 불편함을 겪고 계신 부모님께
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            어린이집을 찾는 모든 과정이 조금 더 편해지길 바랍니다.
                        </p>
                        <ul className="space-y-3.5">
                            {TARGET_AUDIENCES.map((audience) => (
                                <li key={audience} className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 w-[18px] h-[18px] rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                                        <Check size={10} className="text-emerald-600" />
                                    </span>
                                    <span className="text-sm text-gray-700">{audience}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 앞으로의 방향 */}
                    <section className="py-10 border-b border-gray-100">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                            앞으로의 방향
                        </p>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">
                            계속 개선하고 있습니다
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            아직 부족한 점이 많습니다. 더 많은 부모님이 편하게 쓸 수 있도록
                            꾸준히 만들어 나가겠습니다.
                        </p>
                        <ul className="space-y-3">
                            {ROADMAP.map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 w-[18px] h-[18px] rounded-full bg-gray-100 flex items-center justify-center">
                                        <ArrowRight size={9} className="text-gray-400" />
                                    </span>
                                    <span className="text-sm text-gray-600">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 제안 및 문의 */}
                    <section className="py-10 border-b border-gray-100">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                            제안 및 문의
                        </p>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">
                            불편한 점이나 제안이 있으시면 알려주세요
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-5">
                            사용하다가 불편한 점, 추가됐으면 하는 기능, 잘못된 정보 등
                            어떤 내용이든 환영합니다. 더 나은 서비스를 만드는 데 큰 도움이 됩니다.
                        </p>
                        <Button asChild variant="link" className="text-emerald-600 hover:text-emerald-700 px-0">
                            <a href="mailto:artiveloper@gmail.com">
                                artiveloper@gmail.com
                                <ArrowRight size={14} />
                            </a>
                        </Button>
                    </section>

                    {/* CTA */}
                    <section className="py-14">
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">
                                지금 바로 찾아보세요
                            </h2>
                            <p className="text-sm text-gray-500 mb-7">
                                우리 아이에게 꼭 맞는 어린이집을<br />
                                키즐리에서 찾아보세요.
                            </p>
                            <Button
                                asChild
                                size="lg"
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white"
                            >
                                <Link href="/">
                                    어린이집 찾아보기
                                    <ArrowRight size={15} />
                                </Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
