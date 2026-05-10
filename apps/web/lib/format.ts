export function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    if (/^\d{8}$/.test(dateStr)) {
        return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr.replace(/-/g, '.');
    }
    return dateStr;
}
