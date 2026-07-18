import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog'
import ContentHeader from '@/components/content/ContentHeader'
import ContentList from '@/components/content/ContentList'
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
                    <ContentList posts={posts} />
                </div>
            </main>

            <Footer />
        </div>
    )
}
