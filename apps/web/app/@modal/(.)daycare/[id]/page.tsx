import { notFound } from 'next/navigation';
import { runPrefetch } from '@/lib/react-query/prefetch';
import { daycarePrefetch } from '@/domain/daycare/server';
import { HydrationBoundary } from '@/components/providers/ReactQueryProvider';
import { DaycareDetailModal } from '@/components/daycare/detail/DaycareDetailModal';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
    const { id } = await params;

    try {
        const state = await runPrefetch(daycarePrefetch.detail(id));
        return (
            <HydrationBoundary state={state}>
                <DaycareDetailModal id={id} />
            </HydrationBoundary>
        );
    } catch {
        notFound();
    }
}
