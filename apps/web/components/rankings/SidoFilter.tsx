import Link from 'next/link';
import { SIDO_LIST, getSidoShort } from '@/domain/region';

type Props = {
    currentSido?: string;
};

export default function SidoFilter({ currentSido }: Props) {
    const activeClass = 'bg-emerald-600 text-white border-emerald-600';
    const inactiveClass = 'bg-white text-gray-600 border-gray-200 hover:border-gray-400';

    return (
        <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-none sm:flex-wrap sm:overflow-visible py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Link
                href="/rankings"
                className={`shrink-0 text-xs font-semibold px-3 py-2.5 rounded-full border transition-colors ${!currentSido ? activeClass : inactiveClass}`}
            >
                전국
            </Link>
            {SIDO_LIST.map((sido) => (
                <Link
                    key={sido}
                    href={`/rankings?sido=${encodeURIComponent(sido)}`}
                    className={`shrink-0 text-xs font-semibold px-3 py-2.5 rounded-full border transition-colors ${currentSido === sido ? activeClass : inactiveClass}`}
                >
                    {getSidoShort(sido)}
                </Link>
            ))}
        </div>
    );
}
