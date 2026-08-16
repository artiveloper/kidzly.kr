import { SIDO_LIST, getSidoShort } from '@/domain/region';
import SidoFilterChips, { type SidoChipItem } from '@/components/common/SidoFilterChips';

type Props = {
    // undefined = 전국
    sido: string | undefined;
};

const ALL_KEY = '__all';

const ITEMS: SidoChipItem[] = [
    { key: ALL_KEY, label: '전국', href: '/rankings' },
    ...SIDO_LIST.map((s) => ({ key: s, label: getSidoShort(s), href: `/rankings/${encodeURIComponent(s)}` })),
];

export default function SidoFilter({ sido }: Props) {
    return (
        <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-none sm:flex-wrap sm:overflow-visible py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <SidoFilterChips items={ITEMS} activeKey={sido ?? ALL_KEY} />
        </div>
    );
}
