'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function MobileBottomSheet({ isOpen, onClose, children }: MobileBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-[10000] bg-black/30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[10001] bg-white rounded-t-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-out h-[65dvh] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </div>
    </>
  );
}
