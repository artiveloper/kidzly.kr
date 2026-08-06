import 'server-only'
export { daycarePrefetch } from './prefetch/daycare.prefetch'
// sitemap.ts는 React Query 사용 불가 환경이므로 직접 fetch 필요
export { fetchDaycareIdsPaginated } from './apis/daycare.api'
// DaycareDetailSSR에서 cache() memoization과 함께 사용 (generateMetadata 전용)
export { fetchDaycareDetail } from './apis/daycare.api'
// domain/region의 시군구 디렉토리 집계 함수가 배치 스캔에 사용 (build-time/SSR 전용)
export { fetchDaycareRegionRowsPaginated } from './apis/daycare.api'
// RegionHubPageView의 generateMetadata/notFound(totalCount===0) 판단에 직접 사용
export { fetchDaycaresBySigungu } from './apis/daycare.api'
