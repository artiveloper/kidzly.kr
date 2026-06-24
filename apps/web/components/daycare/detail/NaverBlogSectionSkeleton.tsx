export default function NaverBlogSectionSkeleton() {
    return (
        <section className="px-3 py-5 border-t-8 border-gray-100">
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse mb-3" />
            <ul className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <li key={i} className="space-y-1.5">
                        <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-2/3 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-1/4 rounded bg-gray-100 animate-pulse" />
                    </li>
                ))}
            </ul>
        </section>
    );
}
