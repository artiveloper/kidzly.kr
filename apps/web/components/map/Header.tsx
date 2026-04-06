'use client';

import { Search } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onSearch: (v: string) => void;
}

export function Header({ searchQuery, onSearchChange, onSearch }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shadow-sm">
      {/* Logo */}
      <a href="/" className="flex items-center gap-1.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <span className="text-white text-sm font-bold">K</span>
        </div>
        <span className="text-gray-900 font-bold text-lg tracking-tight hidden sm:block">
          kidzly
        </span>
      </a>

      {/* Search bar */}
      <form
        className="flex-1 max-w-lg hidden md:flex"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(searchQuery);
        }}
      >
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="어린이집 이름, 주소로 검색"
            className="w-full h-9 pl-4 pr-10 text-sm bg-gray-100 rounded-full border border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
          >
            <Search size={15} />
          </button>
        </div>
      </form>
    </header>
  );
}
