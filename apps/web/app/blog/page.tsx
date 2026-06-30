import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
    title: '육아 블로그 | Kidzly',
    description: '어린이집 부모를 위한 육아 정보, 지원금 가이드, 보육 꿀팁을 알려드립니다.',
}

export default function BlogPage() {
    const posts = getAllPosts()

    return (
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
            <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">육아 블로그</h1>
            {posts.length === 0 ? (
                <p className="text-gray-500">아직 게시된 글이 없습니다.</p>
            ) : (
                <ul className="space-y-6">
                    {posts.map((post) => (
                        <li key={post.slug}>
                            <Link
                                href={`/blog/${post.slug}`}
                                className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
                            >
                                {post.thumbnail && (
                                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
                                        <Image
                                            src={post.thumbnail}
                                            alt={post.title}
                                            fill
                                            className="object-cover"
                                            sizes="112px"
                                        />
                                    </div>
                                )}
                                <div className="flex flex-col justify-between gap-1">
                                    <div>
                                        <span className="text-xs font-medium text-blue-600">
                                            {post.category}
                                        </span>
                                        <h2 className="mt-1 text-base font-semibold leading-snug text-gray-900 sm:text-lg">
                                            {post.title}
                                        </h2>
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                            {post.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <time>{post.publishedAt}</time>
                                        <span>·</span>
                                        <span>읽기 {post.readingTime}분</span>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    )
}
