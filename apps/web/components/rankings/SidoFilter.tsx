import { getSidoShort } from '@/domain/region';
import { fetchSidoNames } from '@/domain/region/server';
import SidoFilterChips, { type SidoChipItem } from '@/components/common/SidoFilterChips';

type Props = {
    // undefined = 전국
    sido: string | undefined;
};

const ALL_KEY = '__all';

export default async function SidoFilter({ sido }: Props) {
    const sidoNames = await fetchSidoNames();
    const items: SidoChipItem[] = [
        { key: ALL_KEY, label: '전국', href: '/rankings' },
        ...sidoNames.map((s) => ({ key: s, label: getSidoShort(s), href: `/rankings/${encodeURIComponent(s)}` })),
    ];

    return (
        <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-none sm:flex-wrap sm:overflow-visible py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <SidoFilterChips items={items} activeKey={sido ?? ALL_KEY} />
        </div>
    );
}
