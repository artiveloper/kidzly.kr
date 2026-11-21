import 'server-only'
import { cache } from 'react'
import { fetchSigungus } from '@/domain/daycare/server'
import { sortSido } from './index'
import type { SigunguEntry } from './types'

/**
 * 시도 목록을 sigungus 테이블에서 가져온다 — 시도 목록의 진실 소스.
 * 하드코딩 상수 대신 DB를 쓰므로 행정구역 개편으로 새 시도가 생겨도 코드 수정 없이 반영된다.
 * 노출 순서와 짧은 라벨만 domain/region/index.ts의 SIDO_SHORT가 담당한다(DB에 없는 정보).
 *
 * sitemap과 /rankings/[sido]의 generateStaticParams도 이 목록을 쓰므로,
 * 빌드 시점에 이 조회가 실패하면 해당 페이지들이 생성되지 않는다는 점에 유의한다.
 * cache()로 같은 요청/빌드 패스 안에서는 한 번만 조회한다.
 */
export const fetchSidoNames = cache(async (): Promise<string[]> => {
    const rows = await fetchSigungus()
    return sortSido([...new Set(rows.map((row) => row.sidoname))])
})

/**
 * 정적 sigungus 참조 테이블에서 시군구 이름과 코드(arcode)를 가져온다 — 단일 쿼리, 카운트 없음.
 * 참조 테이블이 최신 daycares 데이터와 어긋날 수 있어(폐원·행정구역 변경 등) 등록된
 * 어린이집이 없는 시군구가 섞여 들어올 수 있다 — 해당 칩을 눌러도 목록이 비어 있을 뿐 에러는 아니다.
 *
 * 반대 방향 사각지대(daycares에는 있으나 이 목록에 없어 칩으로 노출되지 않는 어린이집)도 생길 수 있다.
 * 2026 광주·전남이 전남광주통합특별시로 통합됐을 때 12xxx 코드가 그랬다 — 데이터 오염이 아니라
 * 증분 동기화가 개편을 먼저 들여온 것이었다. kidzly-sync 전체 동기화가 시도명 개편을 따라가고
 * API 에서 사라진 옛 시군구를 sigungus 에서 지우도록 고쳐, 이제 다음 전체 동기화에서 맞춰진다.
 *
 * /daycares 지역별 탭 전용.
 * 한 요청 안에서 generateMetadata·h1·지역 디렉터리·목록 섹션이 모두 이 목록을 필요로 하므로
 * cache()로 감싸 조회를 한 번으로 묶는다.
 */
export const fetchSigunguNames = cache(async (): Promise<SigunguEntry[]> => {
    const rows = await fetchSigungus()
    return rows
        .map((row) => ({ sido: row.sidoname, sigungu: row.sigunname, arcode: row.arcode }))
        .sort((a, b) => {
            if (a.sido !== b.sido) return a.sido.localeCompare(b.sido, 'ko')
            return a.sigungu.localeCompare(b.sigungu, 'ko')
        })
})
