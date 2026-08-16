import Header from '@/components/common/Header';

export default function DaycaresLoading() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-14">
                {/* 타이틀 skeleton */}
                <div className="bg-white border-b border-gray-100">
                    <div className="mx-auto max-w-2xl px-4 pt-7 pb-6 animate-pulse">
                        <div className="mb-2 h-6 w-32 rounded bg-gray-100" />
                        <div className="h-4 w-56 rounded bg-gray-100" />
                    </div>
                </div>

                {/* 탭 skeleton */}
                <div className="mx-auto max-w-2xl px-4 flex gap-1 animate-pulse">
                    <div className="px-4 py-2.5">
                        <div className="h-6 w-14 rounded bg-gray-100" />
                    </div>
                    <div className="px-4 py-2.5">
                        <div className="h-6 w-20 rounded bg-gray-100" />
                    </div>
                </div>

                {/* 시도 칩 skeleton */}
                <div className="mx-auto max-w-2xl px-4 pt-6 pb-12">
                    <div className="flex flex-wrap gap-2 animate-pulse">
                        {Array.from({ length: 17 }).map((_, i) => (
                            <div key={i} className="h-10 w-16 rounded-full bg-gray-100" />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
