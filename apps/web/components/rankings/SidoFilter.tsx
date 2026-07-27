import Link from 'next/link';
import { SIDO_LIST, getSidoShort } from '@/domain/region';
import { cn } from '@workspace/ui/lib/utils';

type Props = {
    // undefined = 전국
    sido: string | undefined;
};

function chipClass(active: boolean) {
    return cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-full border px-3.5 text-xs font-semibold transition-colors',
        active
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400',
    );
}

export default function SidoFilter({ sido }: Props) {
    return (
        <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-none sm:flex-wrap sm:overflow-visible py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Link
                href="/rankings"
                className={chipClass(!sido)}
                aria-current={!sido ? 'page' : undefined}
            >
                전국
            </Link>
            {SIDO_LIST.map((s) => (
                <Link
                    key={s}
                    href={`/rankings/${encodeURIComponent(s)}`}
                    className={chipClass(sido === s)}
                    aria-current={sido === s ? 'page' : undefined}
                >
                    {getSidoShort(s)}
                </Link>
            ))}
        </div>
    );
}
