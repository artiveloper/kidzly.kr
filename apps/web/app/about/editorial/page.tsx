// 콘텐츠를 누가·어떻게 만들고 언제 갱신하는지 공개하는 편집·검증 정책 페이지
import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import { UserRound, Bot, FileText, RefreshCw, Check, X, ArrowRight } from "lucide-react"

const LAST_UPDATED = "2026년 8월 20일"

const DESCRIPTION =
    "키즐리 육아 콘텐츠를 누가 쓰고, 어떤 절차로 검증하며, 언제 갱신하는지 공개합니다. AI 도구 활용 범위와 사람 검수 절차를 포함합니다."

export const metadata: Metadata = {
    title: "편집·검증 정책",
    description: DESCRIPTION,
    openGraph: {
        type: "website",
        locale: "ko_KR",
        siteName: "키즐리",
        title: "편집·검증 정책 | 키즐리",
        description: DESCRIPTION,
        url: "https://kidzly.kr/about/editorial",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "키즐리 편집·검증 정책" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "편집·검증 정책 | 키즐리",
        description: DESCRIPTION,
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://kidzly.kr/about/editorial",
    },
}

const PROCESS = [
    {
        step: "1",
        title: "주제를 고릅니다",
        body: "부모가 실제로 검색하는 질문에서 출발합니다. 시기가 지나면 소용없어지는 주제 대신, 몇 년 뒤에도 같은 상황에 놓일 부모가 찾을 주제를 고릅니다.",
    },
    {
        step: "2",
        title: "정부 원문을 모읍니다",
        body: "보건복지부 보육사업안내, 고용노동부 지침, 질병관리청 관리지침, 국가법령정보센터의 법령 조문 같은 1차 자료를 직접 찾아 읽습니다. 블로그나 커뮤니티 글은 근거로 쓰지 않습니다.",
    },
    {
        step: "3",
        title: "초안을 씁니다 — AI 도구를 사용합니다",
        body: "모아둔 원문을 정리하고 초안 문장을 만드는 데 AI 도구를 사용합니다. 흩어진 지침과 조문을 한 편의 글로 대조·정리하는 작업이 사람 손만으로는 느리기 때문입니다. 초안은 그대로 발행되지 않습니다.",
    },
    {
        step: "4",
        title: "수치와 조문을 대조합니다",
        body: "금액·기간·연령 기준·법령 조항을 원문과 하나씩 맞춰봅니다. 확인되지 않은 내용은 단정적으로 쓰지 않고, 근거를 찾지 못하면 뺍니다. 누락이 오류보다 낫다고 봅니다.",
    },
    {
        step: "5",
        title: "사람이 읽고 발행합니다",
        body: "운영자가 전체를 직접 읽고 고친 뒤에 발행합니다. 사람 검수를 거치지 않고 자동으로 올라가는 글은 없습니다.",
    },
]

const SOURCES_USED = [
    "보건복지부·교육부·고용노동부·질병관리청의 공식 지침과 발표",
    "국가법령정보센터(law.go.kr)의 법령·시행령·시행규칙 원문",
    "한국보육진흥원, 육아정책연구소의 연구·통계 자료",
    "어린이집정보공개포털 등 공공 데이터",
    "키즐리가 직접 보유한 전국 어린이집 데이터(정원·현원·대기·교직원 등)",
]

const SOURCES_NOT_USED = [
    "개인 블로그와 맘카페 게시글",
    "출처가 적혀 있지 않은 인포그래픽과 요약 이미지",
    "한 곳에서만 나온 확인되지 않은 보도",
    "2년 이상 지난 법령·통계의 옛 판본",
]

type SectionProps = {
    label: string
    title: string
    children: React.ReactNode
}

function Section({ label, title, children }: SectionProps) {
    return (
        <section className="py-10 border-b border-gray-100">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                {label}
            </p>
            <h2 className="text-lg font-bold text-gray-900 mb-5">{title}</h2>
            {children}
        </section>
    )
}

export default function EditorialPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="daum-wm-title hidden">편집·검증 정책 | 키즐리</div>
            <div className="daum-wm-content hidden">{DESCRIPTION}</div>
            <Header />

            <main className="pt-14">
                <section className="pt-12 pb-12 bg-emerald-50">
                    <div className="max-w-2xl mx-auto px-4">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1 mb-5">
                            <FileText size={11} />
                            편집·검증 정책
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
                            이 글을 누가 쓰고,<br />
                            <span className="text-emerald-600">무엇으로 확인했는지</span>
                        </h1>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            키즐리의 육아 콘텐츠는 보육료·육아휴직급여·감염병 등원 기준처럼
                            잘못 알면 실제 손해로 이어지는 내용을 다룹니다.
                            그래서 만드는 과정을 숨기지 않고 적어둡니다.
                        </p>
                        <p className="text-xs text-gray-400 mt-5">최종 수정: {LAST_UPDATED}</p>
                    </div>
                </section>

                <div className="max-w-2xl mx-auto px-4">
                    <Section label="Who" title="키즐리를 만든 사람이 직접 씁니다">
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>
                                콘텐츠의 기획·검수·발행은 키즐리를 만들고 운영하는 개발자 본인이 합니다.
                                아이를 어린이집에 보내며 같은 서류를 떼고 같은 기한을 놓쳐본 사람의 관점에서
                                무엇이 헷갈리는 지점인지를 기준으로 글을 고릅니다.
                            </p>
                            <p>
                                다만 <span className="font-medium text-gray-800">의사·변호사·보육교사 자격을 가진 전문가는 아닙니다.</span>
                                그래서 개인적인 판단이나 경험담을 근거로 삼지 않고,
                                정부가 공표한 원문에 적힌 것만 사실로 씁니다.
                                글에 나오는 모든 수치와 제도 내용에는 어디서 나온 것인지를 함께 적습니다.
                            </p>
                        </div>

                        <div className="flex items-start gap-2.5 p-4 mt-6 bg-gray-50 rounded-xl border border-gray-100">
                            <UserRound size={15} className="mt-0.5 shrink-0 text-gray-400" />
                            <p className="text-sm text-gray-600 leading-relaxed">
                                전문가의 해석이 필요한 사안은 해석하지 않고, 어디에 물어봐야 하는지를
                                안내하는 선에서 멈춥니다.
                            </p>
                        </div>
                    </Section>

                    <Section label="How" title="다섯 단계를 거쳐 발행합니다">
                        <ol className="space-y-5">
                            {PROCESS.map(({ step, title, body }) => (
                                <li key={step} className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                                        {step}
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <div className="flex items-start gap-2.5 p-4 mt-7 bg-emerald-50 rounded-xl border border-emerald-100">
                            <Bot size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                            <div className="text-sm text-gray-700 leading-relaxed">
                                <p className="font-semibold text-gray-900 mb-1">AI 사용 범위를 밝힙니다</p>
                                <p>
                                    자료 정리와 초안 작성에 AI 도구를 씁니다.
                                    사실 확인과 최종 검수는 사람이 합니다.
                                    검색 순위를 올릴 목적으로 글을 대량 생산하지 않고,
                                    부모가 실제로 겪는 질문 하나에 한 편씩만 씁니다.
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section label="Sources" title="무엇을 근거로 쓰는지">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                            근거로 삼는 것
                        </p>
                        <ul className="space-y-3 mb-7">
                            {SOURCES_USED.map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 w-[18px] h-[18px] rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                        <Check size={10} className="text-emerald-500" />
                                    </span>
                                    <span className="text-sm text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                            근거로 삼지 않는 것
                        </p>
                        <ul className="space-y-3">
                            {SOURCES_NOT_USED.map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="mt-0.5 shrink-0 w-[18px] h-[18px] rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                                        <X size={10} className="text-red-400" />
                                    </span>
                                    <span className="text-sm text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-sm text-gray-600 leading-relaxed mt-6">
                            글 하단의 참고 자료에는 확인에 쓴 원문 링크를 그대로 답니다.
                            독자가 같은 문서를 열어 직접 대조할 수 있어야 한다고 보기 때문입니다.
                        </p>
                    </Section>

                    <Section label="Updates" title="언제 고치고, 언제 내리는지">
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>
                                보육료·급여 상한처럼 해마다 바뀌는 숫자는 제도가 실제로 바뀐 시점에 고칩니다.
                                본문을 고쳤을 때만 수정일을 갱신합니다.
                                <span className="font-medium text-gray-800"> 내용은 그대로 두고 날짜만 새로 찍는 일은 하지 않습니다.</span>
                            </p>
                            <p>
                                제도가 폐지되어 더는 유효하지 않은 글은 최신 내용으로 다시 쓰거나,
                                다른 글에 합치고 내립니다. 오래된 기준이 검색 결과에 남아 있는 것이
                                글이 하나 줄어드는 것보다 나쁘다고 봅니다.
                            </p>
                        </div>

                        <div className="flex items-start gap-2.5 p-4 mt-6 bg-gray-50 rounded-xl border border-gray-100">
                            <RefreshCw size={15} className="mt-0.5 shrink-0 text-gray-400" />
                            <p className="text-sm text-gray-600 leading-relaxed">
                                글 상단에 보이는 날짜가 수정일이면, 그날 본문이 실제로 바뀐 것입니다.
                            </p>
                        </div>
                    </Section>

                    <section className="py-10">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                            Corrections
                        </p>
                        <h2 className="text-lg font-bold text-gray-900 mb-5">
                            틀린 내용을 발견하셨다면
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            수치가 최신이 아니거나 사실과 다른 부분을 보시면 알려주세요.
                            확인 후 고치고, 무엇이 어떻게 바뀌었는지 남깁니다.
                        </p>

                        <Link
                            href="/about#contact"
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-gray-900 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                        >
                            오류 제보하기
                            <ArrowRight size={15} />
                        </Link>

                        <p className="text-xs text-gray-400 leading-relaxed mt-8">
                            키즐리의 콘텐츠는 정보 제공을 목적으로 하며, 개별 사안에 대한 법률·의학적 조언이 아닙니다.
                            신청 자격이나 지급액처럼 개인 상황에 따라 달라지는 사항은
                            관할 주민센터·보육정보센터·고용센터에 최종 확인하시기 바랍니다.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
