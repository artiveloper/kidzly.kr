// 관리자 화면의 날짜·시각 표시 포맷 (apps/web/lib/format.ts 와 동일 규칙)

export function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    if (/^\d{8}$/.test(dateStr)) {
        return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`
    }
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) {
        return `${isoMatch[1]}.${isoMatch[2]}.${isoMatch[3]}`
    }
    return dateStr
}

/**
 * playgrounds.synced_at 은 timezone 없는 TIMESTAMP 에 KST 벽시계 값이 그대로 들어 있다.
 * Date 로 파싱하면 실행 환경 타임존만큼 어긋나므로 문자열을 그대로 잘라 쓴다.
 */
export function formatDateTime(value: string | null): string {
    if (!value) return '-'
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
    if (!match) return value
    return `${match[1]}.${match[2]}.${match[3]} ${match[4]}:${match[5]}`
}
