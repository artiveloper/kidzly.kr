import Image from "next/image"
import Link from "next/link"

export default function Logo() {
    return (
        <Link href="/" aria-label="홈으로">
            <Image src="/logo.png" alt="키즐리" width={96} height={40} priority />
        </Link>
    )
}
