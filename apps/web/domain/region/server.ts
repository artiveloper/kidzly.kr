import 'server-only'
import { fetchDaycareRegionRowsPaginated, fetchSigungus } from '@/domain/daycare/server'
import type { SigunguDirectoryEntry, SigunguEntry } from './types'

const BATCH_SIZE = 1_000

type RegionRow = { sido: string | null; sigungu: string | null }

/**
 * status='정상'인 daycares 레코드를 (sido_name, sigungu_name) 컬럼만 배치로 전량 스캔.
 * sigungus 참조 테이블은 최신 행정구역과 어긋나 신뢰 불가 — 실사용 레코드에서 직접 집계한다.
 */
async function scanRegionRows(sido?: string): Promise<RegionRow[]> {
    const rows: RegionRow[] = []
    let offset = 0

    while (true) {
        const batch = await fetchDaycareRegionRowsPaginated({ offset, limit: BATCH_SIZE, sido })
        rows.push(...batch)
        if (batch.length < BATCH_SIZE) break
        offset += BATCH_SIZE
    }

    return rows
}

/** sido_name/sigungu_name이 없는 레코드는 집계에서 제외하고 (sido, sigungu) 조합별 건수를 센다. */
function aggregate(rows: RegionRow[]): SigunguDirectoryEntry[] {
    const counts = new Map<string, SigunguDirectoryEntry>()

    for (const row of rows) {
        if (!row.sido || !row.sigungu) continue

        const key = `${row.sido}|${row.sigungu}`
        const existing = counts.get(key)
        if (existing) {
            existing.count += 1
        } else {
            counts.set(key, { sido: row.sido, sigungu: row.sigungu, count: 1 })
        }
    }

    return Array.from(counts.values()).sort((a, b) => {
        if (a.sido !== b.sido) return a.sido.localeCompare(b.sido, 'ko')
        return a.sigungu.localeCompare(b.sigungu, 'ko')
    })
}

/**
 * 전국 시군구 디렉토리(실측 257건 내외) — build-time `generateStaticParams`, `sitemap.ts` 전용.
 * React Query가 소비하지 않는 빌드타임/SSR 전용 집계라 query-keys/query-options/hooks 계층을 두지 않는다.
 */
export async function fetchSigunguDirectory(): Promise<SigunguDirectoryEntry[]> {
    const rows = await scanRegionRows()
    return aggregate(rows)
}

/** 특정 시도 스코프로 한정한 시군구 목록 — `/rankings/[sido]` 하단 링크 섹션 전용. */
export async function fetchSigunguListBySido(sido: string): Promise<SigunguDirectoryEntry[]> {
    const rows = await scanRegionRows(sido)
    return aggregate(rows)
}

/**
 * 정적 sigungus 참조 테이블에서 시군구 이름만 가져온다 — 단일 쿼리, 카운트 없음.
 * daycares 24,000여 건을 배치로 전량 스캔하는 fetchSigunguDirectory보다 훨씬 가볍지만,
 * 참조 테이블이 최신 daycares 데이터와 어긋날 수 있어(폐원·행정구역 변경 등) 등록된
 * 어린이집이 없는 시군구가 섞여 들어올 수 있다 — 해당 칩을 눌러도 목록이 비어 있을 뿐 에러는 아니다.
 * /daycares 지역별 탭(사용자 요청 경로) 전용 — generateStaticParams·sitemap.ts는 화이트리스트
 * 정확도가 더 중요해 fetchSigunguDirectory를 그대로 쓴다.
 */
export async function fetchSigunguNames(): Promise<SigunguEntry[]> {
    const rows = await fetchSigungus()
    return rows
        .map((row) => ({ sido: row.sidoname, sigungu: row.sigunname }))
        .sort((a, b) => {
            if (a.sido !== b.sido) return a.sido.localeCompare(b.sido, 'ko')
            return a.sigungu.localeCompare(b.sigungu, 'ko')
        })
}
