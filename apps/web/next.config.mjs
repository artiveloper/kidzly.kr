/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@workspace/ui"],
    async redirects() {
        // /region 인덱스는 /daycares(지역별 탭)로 완전히 대체됨 — /region/[sido] 이하는 그대로 유지
        return [
            { source: "/region", destination: "/daycares", permanent: true },
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
