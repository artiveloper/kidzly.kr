import Image from 'next/image'

type Props = {
    src: string
    alt: string
}

export default function BlogImage({ src, alt }: Props) {
    return (
        <figure className="my-6">
            <Image
                src={src}
                alt={alt}
                width={1080}
                height={1080}
                className="w-full rounded-xl"
                sizes="(max-width: 768px) 100vw, 720px"
            />
            <figcaption className="mt-2 text-center text-sm text-gray-500">{alt}</figcaption>
        </figure>
    )
}
