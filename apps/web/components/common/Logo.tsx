import Image from "next/image"
import Link from "next/link"

export default function Logo() {
    return (
        <Link href="/" aria-label="홈으로" className="inline-flex min-h-11 items-center">
            <Image src="/logo-v2.png" alt="키즐리" width={72} height={15} />
        </Link>
    )
}
