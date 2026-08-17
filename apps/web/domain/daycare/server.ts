import 'server-only'
export { daycarePrefetch } from './prefetch/daycare.prefetch'
// sitemap.ts는 React Query 사용 불가 환경이므로 직접 fetch 필요
export { fetchDaycareIdsPaginated } from './apis/daycare.api'
// DaycareDetailSSR에서 cache() memoization과 함께 사용 (generateMetadata 전용)
export { fetchDaycareDetail } from './apis/daycare.api'
// daycareQueryOptions.regionList(useDaycareRegionList)의 queryFn에서 사용 — /daycares 지역별 탭
export { fetchDaycaresBySigungu } from './apis/daycare.api'
// 홈페이지 통계 섹션의 등록 어린이집 수 표시에 사용
export { fetchDaycareCount } from './apis/daycare.api'
// rankings/[sido] 소개 문단의 지역별 실통계(어린이집 수·평균 대기) 표시에 사용
export { fetchDaycareRegionSummary } from './apis/daycare.api'
// 홈페이지 "지역별 오픈 예정 어린이집" 섹션에 사용
export { fetchDaycareRankingUpcoming } from './apis/daycare.api'
// domain/region의 fetchSigunguNames가 정적 sigungus 참조 테이블 조회에 사용
export { fetchSigungus } from './apis/daycare.api'
// /daycares 지역별 탭이 딥링크의 필터를 클라이언트와 같은 파서로 읽어 prefetch에 반영할 때 사용
export { loadDaycareFilters, toDaycareFilterParams } from './parser/daycare.filter-parsers'
