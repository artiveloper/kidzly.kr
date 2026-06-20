import Link from 'next/link';
import { SIDO_LIST } from '@/domain/daycare';

const SIDO_SHORT: Record<string, string> = {
    '서울특별시': '서울',
    '부산광역시': '부산',
    '대구광역시': '대구',
    '인천광역시': '인천',
    '광주광역시': '광주',
    '대전광역시': '대전',
    '울산광역시': '울산',
    '세종특별자치시': '세종',
    '경기도': '경기',
    '강원특별자치도': '강원',
    '충청북도': '충북',
    '충청남도': '충남',
    '전북특별자치도': '전북',
    '전라남도': '전남',
    '경상북도': '경북',
    '경상남도': '경남',
    '제주특별자치도': '제주',
};

type Props = {
    currentSido?: string;
};

export function SidoFilter({ currentSido }: Props) {
    const activeClass = 'bg-emerald-600 text-white border-emerald-600';
    const inactiveClass = 'bg-white text-gray-600 border-gray-200 hover:border-gray-400';

    return (
        <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-none sm:flex-wrap sm:overflow-visible py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Link
                href="/rankings"
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${!currentSido ? activeClass : inactiveClass}`}
            >
                전국
            </Link>
            {SIDO_LIST.map((sido) => (
                <Link
                    key={sido}
                    href={`/rankings?sido=${encodeURIComponent(sido)}`}
                    className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${currentSido === sido ? activeClass : inactiveClass}`}
                >
                    {SIDO_SHORT[sido] ?? sido}
                </Link>
            ))}
        </div>
    );
}
