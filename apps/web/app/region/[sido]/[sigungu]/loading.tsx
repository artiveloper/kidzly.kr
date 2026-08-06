import RegionDaycareListSkeleton from '@/components/region/RegionDaycareListSkeleton';
import Header from '@/components/common/Header';

export default function RegionSigunguLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="pt-14">
                {/* 히어로(브레드크럼+타이틀) skeleton */}
                <div className="border-b border-gray-100 bg-white">
                    <div className="mx-auto max-w-2xl px-4 pt-5 pb-6 animate-pulse">
                        <div className="mb-3 flex items-center gap-1.5">
                            <div className="h-3 w-8 rounded bg-gray-100" />
                            <div className="h-3 w-3 rounded-full bg-gray-100" />
                            <div className="h-3 w-16 rounded bg-gray-100" />
                            <div className="h-3 w-3 rounded-full bg-gray-100" />
                            <div className="h-3 w-12 rounded bg-gray-100" />
                        </div>
                        <div className="mb-2 h-7 w-48 rounded bg-gray-100" />
                        <div className="h-4 w-56 rounded bg-gray-100" />
                    </div>
                </div>

                <div className="mx-auto max-w-2xl px-4 pt-6 pb-12">
                    <RegionDaycareListSkeleton />
                </div>
            </main>
        </div>
    );
}
