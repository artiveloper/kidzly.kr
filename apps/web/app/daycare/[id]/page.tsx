import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DaycareNotFoundError } from '@/domain/daycare/server';
import {
    getCachedDaycareDetail,
    buildDaycareMetaStrings,
    DaycareDetailSSR,
} from '@/components/daycare/detail/DaycareDetailSSR';
import DaycareDetailLoading from '@/components/daycare/detail/DaycareDetailLoading';

// 어린이집 데이터는 하루 한 번(새벽 3시경) 동기화되므로 요청마다 조회할 이유가 없다.
// 캐시가 없으면 크롤러가 상세 24,000여 건을 훑을 때 그 수만큼 DB 조회가 나가고,
// 그중 하나라도 실패하면 그 페이지가 색인에서 빠졌다. ISR이면 실패 시 직전 캐시가 대신 나간다.
export const revalidate = 3600;

// 빈 배열이면 빌드 시 사전 생성은 없고, 요청이 들어온 상세만 캐시에 채워진다(on-demand ISR).
// 이 선언이 없으면 revalidate를 줘도 Next가 라우트를 매 요청 렌더로 취급한다.
export async function generateStaticParams() {
    return [];
}

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    try {
        const daycare = await getCachedDaycareDetail(id);
        const { title, description } = buildDaycareMetaStrings(daycare);
        const url = `https://kidzly.kr/daycare/${id}`;

        return {
            title: { absolute: title },
            description,
            alternates: { canonical: url },
            openGraph: {
                type: 'website',
                url,
                title,
                description,
                images: [{ url: '/og-image.png', width: 1200, height: 630 }],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
            },
        };
    } catch (error) {
        // 조회 실패(DB 일시 장애)는 그대로 던져 5xx로 응답한다 — 여기서 noindex를 붙이면
        // 정상 어린이집이 "200 + noindex"로 나가 검색엔진 색인에서 빠진다(2026-08-22 네이버 수집 사례).
        if (!(error instanceof DaycareNotFoundError)) throw error;

        // 행이 없는 경우는 Page가 notFound()로 404를 응답한다 — 404 자체가 색인 제외 신호라 robots 메타는 넣지 않는다.
        return {
            title: { absolute: '어린이집 정보 | 키즐리' },
        };
    }
}

export default async function Page({ params }: Props) {
    const { id } = await params;

    // 존재 여부를 셸 렌더 전에 확인한다 — Suspense 안에서 notFound()를 던지면 셸이 이미 전송된 뒤라
    // HTTP 200에 404 화면만 얹힌 soft 404가 된다. 조회는 cache()로 메모이즈돼 쿼리가 늘지 않는다.
    try {
        await getCachedDaycareDetail(id);
    } catch (error) {
        if (!(error instanceof DaycareNotFoundError)) throw error;
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-2xl bg-white shadow-sm">
                <Suspense fallback={<DaycareDetailLoading />}>
                    <DaycareDetailSSR id={id} />
                </Suspense>
            </div>
        </div>
    );
}
