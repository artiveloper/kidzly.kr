import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

type Props = {
    backHref?: string
    backLabel?: string
}

// 랭킹 페이지와 동일한 상단 헤더 UI (로고 + 뒤로가기 링크)
export default function ContentHeader({ backHref = '/', backLabel = '지도로 보기' }: Props) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
            <Link href="/" aria-label="홈으로">
                <Image src="/logo.png" alt="키즐리" width={60} height={28} priority />
            </Link>
            <Link
                href={backHref}
                className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors py-3 pl-2 -mr-1"
            >
                <ArrowLeft size={14} />
                {backLabel}
            </Link>
        </header>
    )
}
