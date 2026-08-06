import Header from '@/components/common/Header';

export default function RegionSidoLoading() {
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
                            <div className="h-3 w-20 rounded bg-gray-100" />
                        </div>
                        <div className="mb-2 h-7 w-48 rounded bg-gray-100" />
                        <div className="h-4 w-64 rounded bg-gray-100" />
                    </div>
                </div>

                {/* 시군구 칩 목록 skeleton */}
                <div className="mx-auto max-w-2xl px-4 pt-6 pb-12">
                    <section className="animate-pulse">
                        <div className="mb-3 h-4 w-40 rounded bg-gray-100" />
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="h-11 w-20 rounded-full bg-gray-100" />
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
