'use client';

import { SIDO_LIST, getSidoShort } from '@/domain/region';

type Props = {
    sido: string | null;
    onSidoChange: (sido: string | null) => void;
};

export default function SidoFilter({ sido, onSidoChange }: Props) {
    const activeClass = 'bg-emerald-600 text-white border-emerald-600';
    const inactiveClass = 'bg-white text-gray-600 border-gray-200 hover:border-gray-400';

    return (
        <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-none sm:flex-wrap sm:overflow-visible py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
                type="button"
                onClick={() => onSidoChange(null)}
                className={`shrink-0 text-xs font-semibold px-3 py-2.5 rounded-full border transition-colors ${!sido ? activeClass : inactiveClass}`}
            >
                전국
            </button>
            {SIDO_LIST.map((s) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onSidoChange(s)}
                    className={`shrink-0 text-xs font-semibold px-3 py-2.5 rounded-full border transition-colors ${sido === s ? activeClass : inactiveClass}`}
                >
                    {getSidoShort(s)}
                </button>
            ))}
        </div>
    );
}
