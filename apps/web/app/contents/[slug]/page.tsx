import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { getAllPosts, getPost } from '@/lib/blog'
import MDXContent from '@/components/blog/MDXContent'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import ViewTracker from '@/components/content/ViewTracker'
import { ContentStatsBadge, LikeButton } from '@/components/content/ContentClientWidgets'

type Props = {
    params: Promise<{ slug: string }>
}

const BASE_URL = 'https://kidzly.kr'

export async function generateStaticParams() {
    return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = getPost(slug)
    if (!post) return {}

    const url = `${BASE_URL}/contents/${encodeURIComponent(post.slug)}`

    return {
        title: `${post.title} | Kidzly`,
        description: post.description,
        keywords: post.keywords,
        alternates: { canonical: url },
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            url,
            publishedTime: post.publishedAt,
            images: post.thumbnail ? [{ url: post.thumbnail, width: 1080, height: 1080 }] : [],
        },
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    const post = getPost(slug)
    if (!post) notFound()

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <ViewTracker uuid={post.uuid} />

            <main className="pt-14">
                <article className="mx-auto max-w-2xl bg-white px-4 py-8 sm:px-6 sm:my-6 sm:rounded-2xl sm:border sm:border-gray-100 sm:shadow-sm">
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        <span className="font-medium text-blue-600">{post.category}</span>
                        <time>{post.publishedAt}</time>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="sr-only">소요시간</span>
                            {post.readingTime}분
                        </span>
                        <ContentStatsBadge uuid={post.uuid} />
                    </div>

                    <h1 className="mb-4 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
                        {post.title}
                    </h1>

                    <p className="mb-6 text-base text-gray-500">{post.description}</p>

                    <div className="prose-sm prose-gray max-w-none">
                        <MDXContent code={post.code} />
                    </div>

                    {post.tags.length > 0 && (
                        <div className="mt-10 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        <LikeButton uuid={post.uuid} />
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <p className="text-xs leading-relaxed text-gray-400">
                            이 글의 내용은 작성 시점 기준이며, 실제 정책·제도와 다를 수 있습니다.
                            중요한 사항은 관할 기관(주민센터, 보건복지부 등)에 직접 확인하세요.
                        </p>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Link
                            href="/contents"
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-gray-200 px-5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            목록으로
                        </Link>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    )
}
