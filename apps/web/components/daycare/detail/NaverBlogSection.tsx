'use client';

import { CircleHelp, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { useNaverBlogInfinite } from '@/domain/naver-blog';

interface NaverBlogSectionProps {
    query: string;
}

export function NaverBlogSection({ query }: NaverBlogSectionProps) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useNaverBlogInfinite(query);
    const posts = data.pages.flatMap((p) => p.items);

    if (posts.length === 0) return null;

    return (
        <section className="px-3 py-5 border-t-8 border-gray-100">
            <div className="flex items-center gap-1.5 mb-3">
                <p className="text-sm font-semibold uppercase tracking-wide">네이버 블로그 관련글</p>
                <Popover>
                    <PopoverTrigger asChild>
                        <button type="button" aria-label="블로그 후기 안내" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <CircleHelp size={14} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-60 text-xs text-gray-600 leading-relaxed">
                        네이버 블로그 검색 API를 통해 연관순으로 가져온 데이터입니다. 검색 특성상 해당 어린이집과 직접 관련이 없는 글이 포함될 수 있습니다.
                    </PopoverContent>
                </Popover>
            </div>
            <ul className="space-y-3">
                {posts.map((post) => (
                    <li key={post.link}>
                        <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 group"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate group-hover:text-green-600 transition-colors">
                                    {post.title}
                                </p>
                                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                    {post.description}
                                </p>
                                <span className="mt-1 block text-xs text-gray-400">{post.postDate}</span>
                            </div>
                            <ExternalLink size={14} className="shrink-0 mt-0.5 text-gray-300 group-hover:text-green-500 transition-colors" />
                        </a>
                    </li>
                ))}
            </ul>
            {hasNextPage && (
                <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="mt-4 w-full py-2 text-xs text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    {isFetchingNextPage ? '불러오는 중...' : '더보기'}
                </button>
            )}
        </section>
    );
}

export function NaverBlogSectionError() {
    return (
        <section className="px-3 py-5 border-t-8 border-gray-100">
            <p className="text-sm font-semibold uppercase tracking-wide mb-3">네이버 블로그 관련글</p>
            <p className="text-sm text-gray-400">블로그 글을 불러올 수 없습니다.</p>
        </section>
    );
}

export function NaverBlogSectionSkeleton() {
    return (
        <section className="px-3 py-5 border-t-8 border-gray-100">
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse mb-3" />
            <ul className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <li key={i} className="space-y-1.5">
                        <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-2/3 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-1/4 rounded bg-gray-100 animate-pulse" />
                    </li>
                ))}
            </ul>
        </section>
    );
}
