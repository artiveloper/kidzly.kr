export default function DaycareNearbySectionSkeleton() {
    return (
        <section className="px-3 py-4 border-t-8 border-gray-100 animate-pulse">
            <div className="h-4 w-32 rounded bg-gray-200 mb-2.5" />
            <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-11 rounded-lg border border-gray-100 bg-white px-3 py-2"
                    >
                        <div className="h-3 w-8 rounded bg-gray-100 mb-1.5" />
                        <div className="h-3 w-4/5 rounded bg-gray-200" />
                    </div>
                ))}
            </div>
        </section>
    );
}
