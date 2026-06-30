import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/blog'
import ContentHeader from '@/components/content/ContentHeader'
import Footer from '@/components/common/Footer'

export const metadata: Metadata = {
    title: '콘텐츠 | 어린이집 부모를 위한 육아 정보 - 키즐리',
    description: '어린이집 부모를 위한 육아 정보, 지원금 가이드, 보육 꿀팁을 알려드립니다.',
}

export default function ContentListPage() {
    const posts = getAllPosts()

    return (
        <div className="min-h-screen bg-gray-50">
            <ContentHeader />

            <main className="pt-14">
                {/* 페이지 소개 */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-2xl mx-auto px-4 pt-7 pb-6">
                        <h1 className="text-xl font-bold text-gray-900 mb-1">콘텐츠</h1>
                        <p className="text-sm text-gray-400">
                            어린이집 부모를 위한 육아 정보·지원금 가이드·보육 꿀팁
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 pb-12 pt-6">
                    {posts.length === 0 ? (
                        <p className="text-sm text-gray-500">아직 게시된 글이 없습니다.</p>
                    ) : (
                        <ul className="space-y-3">
                            {posts.map((post) => (
                                <li key={post.slug}>
                                    <Link
                                        href={`/contents/${post.slug}`}
                                        className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-xs transition hover:border-gray-200 hover:shadow-sm active:bg-gray-50"
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
                </div>
            </main>

            <Footer />
        </div>
    )
}
