'use client';

import { Flame, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import {
    useDaycareRankingWaiting,
    useDaycareRankingCapacity,
    useDaycareRankingOldest,
} from '@/domain/daycare';
import WaitingRankingList from './WaitingRankingList';
import CapacityRankingList from './CapacityRankingList';
import RecentRankingList from './RecentRankingList';

type Props = {
    sido: string | undefined;
};

export default function RankingsLists({ sido }: Props) {
    const regionLabel = sido ?? '전국';
    const params = { sido };

    const { data: waiting } = useDaycareRankingWaiting(params);
    const { data: capacity } = useDaycareRankingCapacity(params);
    const { data: oldest } = useDaycareRankingOldest(params);

    return (
        <>
            <section id="waiting" className="scroll-mt-16">
                <div className="mb-4">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-3 py-1 mb-3 border border-red-100">
                        <Flame size={11} />
                        핫이슈
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                        {regionLabel} 입소 대기 TOP 10
                    </h2>
                    <p className="text-xs text-gray-400">정상 운영 어린이집 중 입소 대기 아동이 가장 많은 곳</p>
                </div>
                <WaitingRankingList items={waiting} />
            </section>

            <section id="capacity" className="scroll-mt-16">
                <div className="mb-4">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-3 py-1 mb-3 border border-blue-100">
                        <Users size={11} />
                        정원 순위
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                        {regionLabel} 정원 많은 어린이집 TOP 10
                    </h2>
                    <p className="text-xs text-gray-400">정원 규모가 가장 큰 어린이집</p>
                </div>
                <CapacityRankingList items={capacity} />
            </section>

            <section id="oldest" className="scroll-mt-16">
                <div className="mb-4">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 rounded-full px-3 py-1 mb-3 border border-amber-100">
                        <Clock size={11} />
                        역사
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                        {regionLabel} 가장 오래된 어린이집 TOP 10
                    </h2>
                    <p className="text-xs text-gray-400">인허가일 기준 가장 역사가 긴 어린이집</p>
                </div>
                <RecentRankingList items={oldest} />
            </section>

            <div className="p-4 bg-white rounded-xl border border-gray-100 text-center">
                <p className="text-sm font-semibold text-gray-900 mb-1">내 주변 어린이집이 궁금하신가요?</p>
                <p className="text-xs text-gray-400 mb-3">지도에서 위치·대기·정원을 한눈에 확인하세요.</p>
                <Link
                    href="/map"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-4 py-2 rounded-lg transition-colors"
                >
                    어린이집 찾아보기
                </Link>
            </div>
        </>
    );
}
