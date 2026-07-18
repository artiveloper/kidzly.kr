'use client'

import { useMemo } from 'react'
import { useQueryState, parseAsString } from 'nuqs'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogPostMeta } from '@/lib/blog'
import { ContentStatsBadge } from '@/components/content/ContentClientWidgets'
import FilterChip from '@/components/common/FilterChip'

type Props = {
    posts: BlogPostMeta[]
}

export default function ContentList({ posts }: Props) {
    const [category, setCategory] = useQueryState('category', parseAsString)

    const categories = useMemo(
        () => Array.from(new Set(posts.map((post) => post.category))),
        [posts],
    )

    const filteredPosts = category ? posts.filter((post) => post.category === category) : posts

    return (
        <div>
            {categories.length > 1 && (
                <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-none sm:flex-wrap sm:overflow-visible py-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-2">
                    <FilterChip active={category === null} onClick={() => setCategory(null)}>
                        전체
                    </FilterChip>
                    {categories.map((name) => (
                        <FilterChip key={name} active={category === name} onClick={() => setCategory(name)}>
                            {name}
                        </FilterChip>
                    ))}
                </div>
            )}

            {filteredPosts.length === 0 ? (
                <p className="text-sm text-gray-500">
                    {posts.length === 0 ? '아직 게시된 글이 없습니다.' : '해당 카테고리의 글이 아직 없습니다.'}
                </p>
            ) : (
                <ul className="space-y-3">
                    {filteredPosts.map((post) => (
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
                                        <span>{post.readingTime}분 소요</span>
                                        <span>·</span>
                                        <ContentStatsBadge uuid={post.uuid} />
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
