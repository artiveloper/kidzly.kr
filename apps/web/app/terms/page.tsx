import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import Footer from "@/components/common/Footer"

const LAST_UPDATED = "2026년 7월 3일"

export const metadata: Metadata = {
    title: "이용약관",
    description: "키즐리 이용약관입니다. 서비스 이용 조건 및 규정을 안내합니다.",
    robots: { index: true, follow: true },
    alternates: {
        canonical: "https://kidzly.kr/terms",
    },
}

type SectionProps = {
    number: string
    title: string
    children: React.ReactNode
}

function Section({ number, title, children }: SectionProps) {
    return (
        <section className="py-8 border-b border-gray-100">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                제 {number} 조
            </p>
            <h2 className="text-base font-bold text-gray-900 mb-4">{title}</h2>
            {children}
        </section>
    )
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4">
                <Link href="/">
                    <Image src="/logo.png" alt="키즐리" width={60} height={25} priority />
                </Link>
            </header>

            <main className="pt-14">
                <div className="max-w-lg mx-auto px-5">
                    <div className="pt-10 pb-4">
                        <h1 className="text-xl font-bold text-gray-900 mb-1">이용약관</h1>
                        <p className="text-xs text-gray-400">시행일: {LAST_UPDATED}</p>
                    </div>

                    <Section number="1" title="목적">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            본 약관은 키즐리(이하 "서비스")가 제공하는 어린이집 검색·랭킹·육아 콘텐츠 등
                            제반 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리·의무 및
                            기타 필요한 사항을 규정함을 목적으로 합니다.
                        </p>
                    </Section>

                    <Section number="2" title="서비스의 내용">
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>서비스는 다음 기능을 제공합니다.</p>
                            <ul className="space-y-1.5">
                                {[
                                    "지도 기반 어린이집 검색 및 조회",
                                    "어린이집 유형·운영시간·대기 현황 등 상세 정보 제공",
                                    "조건별 필터 검색",
                                    "지역별 어린이집 랭킹 제공 (대기 현황·정원·설립 연도 기준)",
                                    "어린이집 부모를 위한 육아 콘텐츠 제공 (지원금·입소 준비·보육 꿀팁 등)",
                                    "네이버 블로그 검색 API를 통한 어린이집 관련 블로그 글 제공",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                                서비스에서 제공하는 어린이집 정보는 정부 공공 데이터(어린이집 정보공개포털)를
                                기반으로 하며, 실제 현황과 다를 수 있습니다. 중요한 사항은 해당 어린이집에
                                직접 확인하시기 바랍니다.
                            </p>
                        </div>
                    </Section>

                    <Section number="3" title="서비스 이용">
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>
                                서비스는 별도의 회원가입 없이 누구나 무료로 이용할 수 있습니다.
                            </p>
                            <p>
                                이용자는 서비스를 이용함으로써 본 약관에 동의한 것으로 간주합니다.
                            </p>
                        </div>
                    </Section>

                    <Section number="4" title="광고">
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>
                                서비스는 Google AdSense를 통해 광고를 게재할 수 있습니다.
                                광고는 Google의 광고 시스템을 통해 제공되며,
                                이용자의 관심사에 기반한 맞춤형 광고가 노출될 수 있습니다.
                            </p>
                            <p>
                                광고에 관한 문의는{" "}
                                <a
                                    href="https://support.google.com/adsense"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 underline underline-offset-2"
                                >
                                    Google AdSense 고객센터
                                </a>
                                를 통해 하시기 바랍니다.
                            </p>
                        </div>
                    </Section>

                    <Section number="5" title="이용자의 의무">
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
                            <ul className="space-y-1.5">
                                {[
                                    "서비스를 통해 제공된 정보의 무단 복제·배포·상업적 이용",
                                    "서비스의 정상적인 운영을 방해하는 행위",
                                    "기타 관련 법령을 위반하는 행위",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Section>

                    <Section number="6" title="서비스 변경 및 중단">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            서비스는 운영상·기술상 필요에 따라 서비스 내용을 변경하거나
                            중단할 수 있습니다. 중요한 변경이 있을 경우 서비스 내 공지를 통해
                            사전에 안내합니다.
                        </p>
                    </Section>

                    <Section number="7" title="면책">
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>
                                서비스는 공공 데이터를 기반으로 정보를 제공하며,
                                정보의 정확성·완전성에 대해 보증하지 않습니다.
                            </p>
                            <p>
                                서비스 내 육아 콘텐츠는 정보 제공 목적으로 작성되었으며,
                                제도 변경 등으로 실제 내용과 다를 수 있습니다.
                                지원금·정책 등 중요한 사항은 관련 기관에 직접 확인하시기 바랍니다.
                            </p>
                            <p>
                                서비스에서 제공하는 네이버 블로그 관련글은 제3자가 작성한 외부 콘텐츠입니다.
                                검색 특성상 해당 어린이집과 직접 관련이 없거나 부정확한 내용이 포함될 수 있으며,
                                서비스는 해당 콘텐츠의 정확성·신뢰성에 대해 책임을 지지 않습니다.
                            </p>
                            <p>
                                서비스 이용으로 발생한 손해에 대해 서비스는 고의 또는 중과실이
                                없는 한 책임을 지지 않습니다.
                            </p>
                        </div>
                    </Section>

                    <Section number="8" title="준거법 및 관할">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            본 약관은 대한민국 법률에 따라 해석되며,
                            서비스 이용으로 발생한 분쟁은 관련 법령에 따른 절차에 따릅니다.
                        </p>
                    </Section>

                    <Section number="9" title="약관 변경">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            본 약관은 서비스 변경 또는 법령 변경에 따라 수정될 수 있습니다.
                            변경 시 시행일 7일 전부터 본 페이지를 통해 공지합니다.
                        </p>
                    </Section>

                    <div className="py-8 border-b border-gray-100">
                        <p className="text-sm text-gray-600 mb-3">문의</p>
                        <a href="mailto:artiveloper@gmail.com" className="text-sm text-emerald-600">
                            artiveloper@gmail.com
                        </a>
                    </div>

                    <div className="py-10 text-center">
                        <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-700">
                            홈으로 돌아가기
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
