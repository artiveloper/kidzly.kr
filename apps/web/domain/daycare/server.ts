import 'server-only'
export { daycarePrefetch } from './prefetch/daycare.prefetch'
// sitemap.ts는 React Query 사용 불가 환경이므로 직접 fetch 필요
export { fetchDaycareIdsPaginated } from './apis/daycare.api'
// DaycareDetailSSR에서 cache() memoization과 함께 사용 (generateMetadata 전용)
export { fetchDaycareDetail } from './apis/daycare.api'
