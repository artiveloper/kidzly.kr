import { DaycareDetailModal } from '@/components/daycare/detail/DaycareDetailModal';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
    const { id } = await params;
    return <DaycareDetailModal id={id} />;
}
