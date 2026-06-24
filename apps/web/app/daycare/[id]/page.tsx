import { Suspense } from 'react';
import type { Metadata } from 'next';
import {
    getCachedDaycareDetail,
    buildDaycareMetaStrings,
    DaycareDetailSSR,
} from '@/components/daycare/detail/DaycareDetailSSR';
import { DaycareDetailLoading } from '@/components/daycare/detail/DaycareDetailLoading';

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
                type: 'article',
                url,
                title,
                description,
                images: [{ url: '/og-image.png', width: 1200, height: 630 }],
                ...(daycare.syncedAt ? {
                    modifiedTime: daycare.syncedAt,
                    publishedTime: daycare.syncedAt,
                } : {}),
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
            },
        };
    } catch {
        return {
            title: '어린이집 정보 | 키즐리',
            alternates: { canonical: `https://kidzly.kr/daycare/${id}` },
        };
    }
}

export default async function Page({ params }: Props) {
    const { id } = await params;

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
