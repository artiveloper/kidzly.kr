const TYPE_COLORS: Record<string, string> = {
    '국공립': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '민간': 'bg-blue-50 text-blue-700 border-blue-200',
    '가정': 'bg-orange-50 text-orange-700 border-orange-200',
    '법인': 'bg-purple-50 text-purple-700 border-purple-200',
    '직장': 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function TypeBadge({ typeName, className = '' }: { typeName: string; className?: string }) {
    const key = Object.keys(TYPE_COLORS).find((k) => typeName.includes(k)) ?? '';
    const colorClass = TYPE_COLORS[key] ?? 'bg-gray-50 text-gray-600 border-gray-200';
    return (
        <span className={`inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded border ${colorClass} ${className}`}>
            {typeName}
        </span>
    );
}
