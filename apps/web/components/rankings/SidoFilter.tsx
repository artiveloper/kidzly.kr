'use client';

import { SIDO_LIST, getSidoShort } from '@/domain/region';
import FilterChip from '@/components/common/FilterChip';

type Props = {
    sido: string | null;
    onSidoChange: (sido: string | null) => void;
};

export default function SidoFilter({ sido, onSidoChange }: Props) {
    return (
        <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-none sm:flex-wrap sm:overflow-visible py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <FilterChip active={!sido} onClick={() => onSidoChange(null)}>
                전국
            </FilterChip>
            {SIDO_LIST.map((s) => (
                <FilterChip key={s} active={sido === s} onClick={() => onSidoChange(s)}>
                    {getSidoShort(s)}
                </FilterChip>
            ))}
        </div>
    );
}
