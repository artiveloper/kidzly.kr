import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getAllPosts, getPost } from '@/lib/blog'
import MDXContent from '@/components/blog/MDXContent'
import ContentHeader from '@/components/content/ContentHeader'
import Footer from '@/components/common/Footer'
import ViewTracker from '@/components/content/ViewTracker'
import { ContentStatsBadge, LikeButton } from '@/components/content/ContentClientWidgets'

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = getPost(slug)
    if (!post) return {}

    return {
        title: `${post.title} | Kidzly`,
        description: post.description,
        keywords: post.keywords,
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
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
            <ContentHeader backHref="/contents" backLabel="목록으로" />
            <ViewTracker uuid={post.uuid} />

            <main className="pt-14">
                <article className="mx-auto max-w-2xl bg-white px-4 py-8 sm:px-6 sm:my-6 sm:rounded-2xl sm:border sm:border-gray-100 sm:shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-medium text-blue-600">{post.category}</span>
                        <span>·</span>
                        <time>{post.publishedAt}</time>
                        <span>·</span>
                        <span>{post.readingTime}분 소요</span>
                        <span>·</span>
                        <ContentStatsBadge uuid={post.uuid} />
                    </div>

                    <h1 className="mb-4 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
                        {post.title}
                    </h1>

                    <p className="mb-6 text-base text-gray-500">{post.description}</p>

                    {post.thumbnail && (
                        <div className="mb-8 overflow-hidden rounded-xl">
                            <Image
                                src={post.thumbnail}
                                alt={post.title}
                                width={1080}
                                height={1080}
                                className="w-full"
                                priority
                            />
                        </div>
                    )}

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
                </article>
            </main>

            <Footer />
        </div>
    )
}
