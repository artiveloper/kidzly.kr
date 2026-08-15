import Link from "next/link"

export default function Footer() {
    return (
        <footer className="border-t border-gray-100 py-8">
            <div className="max-w-lg mx-auto px-5 flex flex-col items-center gap-3">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
                    <Link href="/about" className="hover:text-gray-900 transition-colors">
                        서비스 소개
                    </Link>
                    <span className="w-px h-3 bg-gray-200" />
                    <Link href="/region" className="hover:text-gray-900 transition-colors">
                        지역별 보기
                    </Link>
                    <span className="w-px h-3 bg-gray-200" />
                    <Link href="/about#contact" className="hover:text-gray-900 transition-colors">
                        문의
                    </Link>
                    <span className="w-px h-3 bg-gray-200" />
                    <Link href="/terms" className="hover:text-gray-900 transition-colors">
                        이용약관
                    </Link>
                    <span className="w-px h-3 bg-gray-200" />
                    <Link href="/privacy-policy" className="font-bold hover:text-gray-900 transition-colors">
                        개인정보처리방침
                    </Link>
                </div>
                <p className="text-sm text-gray-500">© {new Date().getFullYear()} 키즐리</p>
            </div>
        </footer>
    )
}
