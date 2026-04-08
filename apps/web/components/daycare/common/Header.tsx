'use client';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm">
            <a href="/" className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">K</span>
                </div>
                <span className="text-gray-900 font-bold text-lg tracking-tight hidden sm:block">
                    kidzly
                </span>
            </a>
        </header>
    );
}
