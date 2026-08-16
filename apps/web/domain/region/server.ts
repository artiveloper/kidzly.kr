import 'server-only'
import { fetchSigungus } from '@/domain/daycare/server'
import type { SigunguEntry } from './types'

/**
 * 정적 sigungus 참조 테이블에서 시군구 이름만 가져온다 — 단일 쿼리, 카운트 없음.
 * 참조 테이블이 최신 daycares 데이터와 어긋날 수 있어(폐원·행정구역 변경 등) 등록된
 * 어린이집이 없는 시군구가 섞여 들어올 수 있다 — 해당 칩을 눌러도 목록이 비어 있을 뿐 에러는 아니다.
 * /daycares 지역별 탭 전용.
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
