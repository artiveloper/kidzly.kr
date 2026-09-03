// 로고·서비스 메뉴 그룹·데이터 출처 고지를 묶어 렌더링하는 전역 푸터
import Link from "next/link"
import Logo from "@/components/common/Logo"

// docs/content/README.md의 카테고리 체계 5개와 순서를 그대로 따른다.
// /contents는 nuqs로 ?category= 필터를 읽으므로 값이 카테고리명과 정확히 일치해야 한다
const CONTENT_CATEGORIES = [
    "양육 지원금",
    "일·가정 양립",
    "입소·등원 가이드",
    "주거·생활 지원",
    "어린이집 생활",
]

const LINK_GROUPS = [
    {
        title: "어린이집 찾기",
        links: [
            { href: "/map", label: "지도로 찾기" },
            { href: "/daycares", label: "어린이집 목록" },
            { href: "/rankings", label: "지역별 랭킹" },
        ],
    },
    {
        title: "콘텐츠",
        links: [
            ...CONTENT_CATEGORIES.map((category) => ({
                href: `/contents?category=${encodeURIComponent(category)}`,
                label: category,
            })),
            { href: "/contents", label: "전체 보기" },
        ],
    },
    {
        title: "안내",
        links: [
            { href: "/about", label: "서비스 소개" },
            { href: "/about/editorial", label: "편집·검증 정책" },
            { href: "/about#contact", label: "문의와 제보" },
            { href: "/terms", label: "이용약관" },
            { href: "/privacy-policy", label: "개인정보처리방침" },
        ],
    },
]

export default function Footer() {
    return (
        <footer className="border-t border-gray-100 bg-gray-50">
            <div className="max-w-2xl mx-auto px-5 py-10">
                <div className="flex flex-col gap-8 sm:flex-row sm:gap-8">
                    <div className="sm:w-40 sm:shrink-0">
                        <Logo />
                        <p className="mt-3 text-sm text-gray-500">공공데이터 기반 어린이집 정보 서비스</p>
                    </div>

                    <nav aria-label="푸터" className="grid flex-1 grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                        {LINK_GROUPS.map((group) => (
                            <div key={group.title}>
                                <h2 className="text-sm font-bold text-gray-900">{group.title}</h2>
                                <ul className="mt-1">
                                    {group.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="flex min-h-11 items-center text-sm text-gray-600 transition-colors hover:text-gray-900"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="mt-8 space-y-2 border-t border-gray-200 pt-6 text-xs leading-relaxed text-gray-500">
                    <p>
                        데이터 출처: 보건복지부 어린이집 정보공개포털. 공시 시점 기준이라 실제 운영 상황과 다를 수
                        있으니 입소 문의는 해당 시설에 직접 확인하세요.
                    </p>
                    <p>
                        © {new Date().getFullYear()} 키즐리 (kidzly.kr). 문의:{" "}
                        <a
                            href="mailto:artiveloper@gmail.com"
                            className="underline underline-offset-2 transition-colors hover:text-gray-900"
                        >
                            artiveloper@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    )
}
