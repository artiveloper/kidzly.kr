import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';

interface ContentPromoCardProps {
    post: BlogPostMeta;
}

export default function ContentPromoCard({ post }: ContentPromoCardProps) {
    return (
        <Link
            href={`/contents/${post.slug}`}
            className="block border-b border-gray-100 bg-emerald-50/60 px-4 py-3.5 transition-colors hover:bg-emerald-50"
        >
            <div className="mb-1 flex items-center gap-1.5">
                <Sparkles size={12} className="shrink-0 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">육아 정보</span>
            </div>
            <p className="line-clamp-2 text-sm font-medium text-gray-900">{post.title}</p>
        </Link>
    );
}
