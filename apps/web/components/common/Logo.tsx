import Image from "next/image"
import Link from "next/link"

export default function Logo() {
    return (
        // 레이아웃 높이(h-5)는 푸터 메뉴 타이틀(text-sm = 20px)에 맞추고,
        // 44px 터치 타겟은 레이아웃을 밀지 않는 가상 요소로 확보한다
        <Link
            href="/"
            aria-label="홈으로"
            className="relative inline-flex h-5 items-center after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"
        >
            <Image src="/logo-v2.png" alt="키즐리" width={72} height={15} />
        </Link>
    )
}
