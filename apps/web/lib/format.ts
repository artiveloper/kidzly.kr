export function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    if (/^\d{8}$/.test(dateStr)) {
        return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
    }
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        return `${isoMatch[1]}.${isoMatch[2]}.${isoMatch[3]}`;
    }
    return dateStr;
}
