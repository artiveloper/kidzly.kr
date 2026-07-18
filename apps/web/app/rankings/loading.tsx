import RankingsSkeleton from '@/components/rankings/RankingsSkeleton';
import Header from '@/components/common/Header';

export default function RankingsLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="pt-14">
                {/* 히어로 섹션 skeleton */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-lg mx-auto px-4 pt-7 pb-6 animate-pulse">
                        <div className="flex items-center justify-between gap-3 mb-1">
                            <div className="w-32 h-7 rounded bg-gray-100" />
                            <div className="w-8 h-8 rounded-full bg-gray-100" />
                        </div>
                        <div className="w-52 h-4 rounded bg-gray-100 mb-5 mt-2" />
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-white">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100" />
                                    <div className="space-y-1">
                                        <div className="w-full h-3 rounded bg-gray-100" />
                                        <div className="w-3/4 h-3 rounded bg-gray-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <RankingsSkeleton />
            </main>
        </div>
    );
}
