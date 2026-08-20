import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import Footer from "@/components/common/Footer"

const LAST_UPDATED = "2026년 6월 20일"

export const metadata: Metadata = {
    title: "개인정보처리방침",
    description: "키즐리 개인정보처리방침입니다. 수집하는 개인정보 항목, 이용 목적, 보유 기간 등을 안내합니다.",
    alternates: {
        canonical: "https://kidzly.kr/privacy-policy",
    },
}

type SectionProps = {
    label: string
    title: string
    children: React.ReactNode
}

function Section({ label, title, children }: SectionProps) {
    return (
        <section className="py-8 border-b border-gray-100">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {label}
            </p>
            <h2 className="text-base font-bold text-gray-900 mb-4">{title}</h2>
            {children}
        </section>
    )
}

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4">
                <Link href="/">
                    <Image src="/logo.png" alt="키즐리" width={80} height={34} priority />
                </Link>
            </header>

            <main className="pt-14">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="pt-10 pb-4">
                        <h1 className="text-xl font-bold text-gray-900 mb-1">개인정보처리방침</h1>
                        <p className="text-xs text-gray-400">시행일: {LAST_UPDATED}</p>
                    </div>

                    <Section label="개요" title="개인정보 보호에 관한 안내">
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>
                                키즐리(이하 "서비스")는 이용자의 개인정보를 소중히 여기며,
                                「개인정보 보호법」 등 관련 법령을 준수합니다.
                            </p>
                            <p>
                                본 방침은 서비스가 수집하는 정보의 종류, 이용 목적,
                                보유 기간 및 이용자의 권리에 대해 안내합니다.
                            </p>
                        </div>
                    </Section>

                    <Section label="수집 항목" title="수집하는 개인정보">
                        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                            <div>
                                <p className="font-medium text-gray-800 mb-2">자동 수집 정보</p>
                                <p className="text-gray-500 mb-2">서비스 이용 과정에서 아래 정보가 자동으로 수집될 수 있습니다.</p>
                                <ul className="space-y-1.5 text-gray-600">
                                    {[
                                        "IP 주소",
                                        "브라우저 종류 및 버전",
                                        "방문 일시 및 이용 기록",
                                        "쿠키(Cookie) 및 유사 기술을 통한 식별자",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                                서비스는 회원가입이 없으며, 이름·이메일·전화번호 등의 개인정보를 직접 수집하지 않습니다.
                            </p>
                        </div>
                    </Section>

                    <Section label="이용 목적" title="개인정보 수집 및 이용 목적">
                        <ul className="space-y-2 text-sm text-gray-600">
                            {[
                                "서비스 제공 및 운영",
                                "서비스 이용 통계 분석 및 품질 개선",
                                "맞춤형 광고 제공 (Google AdSense)",
                                "부정 이용 방지 및 보안",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section label="보유 기간" title="개인정보 보유 및 이용 기간">
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>
                                자동 수집 정보는 수집 목적 달성 시 지체 없이 파기합니다.
                                단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">서비스 이용 기록</span>
                                    <span className="text-gray-500">3개월</span>
                                </div>
                                <div className="h-px bg-gray-200" />
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">전자상거래 관련 기록 (해당 시)</span>
                                    <span className="text-gray-500">5년 (전자상거래법)</span>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section label="제3자 제공" title="개인정보의 제3자 제공 및 위탁">
                        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                            <p>
                                서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
                                단, 서비스 운영을 위해 아래 업체에 처리를 위탁합니다.
                            </p>
                            <div className="space-y-2">
                                {[
                                    { name: "Google LLC", purpose: "서비스 이용 통계 (Google Analytics)", retention: "서비스 이용 종료 시" },
                                    { name: "Google LLC", purpose: "광고 게재 (Google AdSense)", retention: "서비스 이용 종료 시" },
                                    { name: "Vercel Inc.", purpose: "서비스 호스팅", retention: "서비스 이용 종료 시" },
                                    { name: "Naver Corp.", purpose: "블로그 검색 API 제공 (검색어만 전달, 이용자 개인정보 미포함)", retention: "API 호출 즉시" },
                                ].map((item) => (
                                    <div key={item.purpose} className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs font-medium text-gray-800 mb-1">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.purpose}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                                네이버 블로그 관련글을 클릭하면 네이버(naver.com)로 이동하며, 이후의 정보 처리는 네이버의 개인정보처리방침을 따릅니다.
                            </p>
                        </div>
                    </Section>

                    <Section label="쿠키" title="쿠키(Cookie) 사용에 관한 사항">
                        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                            <p>
                                서비스는 Google Analytics 및 Google AdSense를 통해 쿠키를 사용합니다.
                                쿠키는 이용자의 브라우저에 저장되는 소량의 데이터로,
                                서비스 이용 통계 수집 및 관심사 기반 광고 제공에 활용됩니다.
                            </p>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-semibold text-amber-800">Google 광고 쿠키 안내</p>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    Google은 이 사이트에 광고를 게재하기 위해 쿠키를 사용합니다.
                                    이용자의 이전 방문 기록을 바탕으로 관심사 기반 광고가 표시될 수 있습니다.
                                </p>
                                <a
                                    href="https://policies.google.com/technologies/partner-sites"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-amber-700 underline underline-offset-2"
                                >
                                    Google이 파트너 사이트 정보를 사용하는 방식 보기
                                </a>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                네이버 블로그 관련글 링크를 클릭하면 네이버(naver.com)로 이동하며,
                                해당 페이지에서의 쿠키 사용은 네이버의 개인정보처리방침을 따릅니다.
                            </p>
                            <div>
                                <p className="font-medium text-gray-800 mb-2">쿠키 거부 방법</p>
                                <ul className="space-y-1.5 text-gray-500">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                        브라우저 설정 &gt; 쿠키 차단으로 거부 가능 (일부 기능 제한될 수 있음)
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                        <span>
                                            Google 광고 맞춤설정 거부:{" "}
                                            <a
                                                href="https://adssettings.google.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-emerald-600 underline underline-offset-2"
                                            >
                                                g.co/adsettings
                                            </a>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Section>

                    <Section label="이용자 권리" title="이용자의 권리">
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>이용자는 개인정보와 관련하여 아래 권리를 행사할 수 있습니다.</p>
                            <ul className="space-y-1.5">
                                {[
                                    "개인정보 처리 현황 열람 요청",
                                    "처리 중인 개인정보의 정정·삭제 요청",
                                    "개인정보 처리 정지 요청",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-gray-500">
                                권리 행사는 아래 개인정보 보호책임자에게 이메일로 요청하실 수 있습니다.
                            </p>
                        </div>
                    </Section>

                    <Section label="책임자" title="개인정보 보호책임자">
                        <div className="bg-gray-50 rounded-xl p-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex gap-3">
                                    <span className="text-gray-400 w-16 shrink-0">서비스명</span>
                                    <span className="text-gray-700">키즐리</span>
                                </div>
                                <div className="h-px bg-gray-200" />
                                <div className="flex gap-3">
                                    <span className="text-gray-400 w-16 shrink-0">이메일</span>
                                    <a href="mailto:artiveloper@gmail.com" className="text-emerald-600">
                                        artiveloper@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section label="변경 안내" title="개인정보처리방침 변경">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            본 방침은 법령 변경 또는 서비스 변경에 따라 수정될 수 있습니다.
                            변경 시 시행일 7일 전부터 본 페이지를 통해 공지합니다.
                        </p>
                    </Section>

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
