import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type BreadcrumbItem = {
    label: string;
    href?: string;
};

type Props = {
    items: BreadcrumbItem[];
};

// 범용 시맨틱 브레드크럼 — 도메인 무관, 마지막 항목은 현재 페이지로 취급(링크 없이 aria-current)
export default function Breadcrumb({ items }: Props) {
    return (
        <nav aria-label="breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                            {item.href && !isLast ? (
                                <Link href={item.href} className="hover:text-gray-700 hover:underline">
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={isLast ? 'font-semibold text-gray-700' : ''}
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {item.label}
                                </span>
                            )}
                            {!isLast && (
                                <ChevronRight size={12} className="text-gray-400" aria-hidden="true" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
