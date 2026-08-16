import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getAllPosts } from '@/lib/blog'
import { buildBreadcrumbJsonLd } from '@/lib/structured-data/breadcrumb'
import ContentList from '@/components/content/ContentList'
import ContentListSkeleton from '@/components/content/ContentListSkeleton'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

const BASE_URL = 'https://kidzly.kr'
const TITLE = '콘텐츠 | 어린이집 부모를 위한 육아 정보 - 키즐리'
const DESCRIPTION = '어린이집 부모를 위한 육아 정보, 지원금 가이드, 보육 꿀팁을 알려드립니다.'

export const metadata: Metadata = {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: `${BASE_URL}/contents` },
}

const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: '키즐리', url: BASE_URL },
    { name: '콘텐츠', url: `${BASE_URL}/contents` },
])

export default function ContentListPage() {
    const posts = getAllPosts()

    return (
        <div className="min-h-screen bg-gray-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <div className="daum-wm-title hidden">{TITLE}</div>
            <div className="daum-wm-content hidden">{DESCRIPTION}</div>
            <Header />

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
                    <Suspense fallback={<ContentListSkeleton />}>
                        <ContentList posts={posts} />
                    </Suspense>
                </div>
            </main>

            <Footer />
        </div>
    )
}
