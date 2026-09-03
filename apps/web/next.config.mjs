/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@workspace/ui", "@workspace/supabase"],
    images: {
        // 기본값은 webp만 생성한다 — 블로그 썸네일에 더 작은 avif를 먼저 시도하게 한다
        formats: ["image/avif", "image/webp"],
        // 썸네일·로고는 거의 바뀌지 않는다. 최적화 결과를 31일간 재사용한다
        minimumCacheTTL: 2678400,
    },
    experimental: {
        // lucide-react는 Next 기본 목록에 포함되어 있어 넣지 않는다
        optimizePackageImports: ["@workspace/ui"],
    },
    async headers() {
        // public/ 자산은 Vercel이 max-age=0, must-revalidate로 내보내 방문마다 재검증 왕복이 생긴다.
        // 폰트 서브셋은 파일명이 버전 고정이라 immutable로 못 박는다
        return [
            {
                source: "/fonts/:path*",
                headers: [
                    { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
                ],
            },
        ]
    },
    async redirects() {
        // /region은 /daycares 경로형 지역 목록으로 완전히 대체됨.
        // 시도·시군구 세그먼트 이름이 그대로 대응하므로 1:1로 넘긴다. 다만 옛 /region은 시군구
        // 이름의 공백을 %20으로 그대로 실었고 지금 표준 슬러그는 하이픈이라, 공백이 든 17개 지역은
        // 여기서 한 번, 라우트의 슬러그 정규화에서 다시 한 번 301을 탄다(2홉).
        return [
            { source: "/region", destination: "/daycares", permanent: true },
            { source: "/region/:sido", destination: "/daycares/:sido", permanent: true },
            {
                source: "/region/:sido/:sigungu",
                destination: "/daycares/:sido/:sigungu",
                permanent: true,
            },
            // 보육료 글 2개가 사실상 같은 주제라 하나로 통합 — 흡수된 쪽을 유지 슬러그로 넘김
            {
                source: "/contents/보육료-지원-누가-얼마나",
                destination: "/contents/보육료-지원-대상-및-금액",
                permanent: true,
            },
        ]
    },
}

// Run Velite on config load so it works under both webpack and Turbopack
// (the webpack-plugin integration does not fire when `--turbopack` is used).
const isDev = process.argv.includes("dev")
const isBuild = process.argv.includes("build")
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
    process.env.VELITE_STARTED = "1"
    const { build } = await import("velite")
    await build({ watch: isDev, clean: !isDev })
}

export default nextConfig
