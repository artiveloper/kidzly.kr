/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@workspace/ui", "@workspace/supabase"],
    async headers() {
        // HTML 이 아닌 응답(리다이렉트·robots.txt·RSC 페이로드)에는 meta 태그가 실리지 않는다.
        // 모든 응답에 헤더로 색인 금지를 강제한다.
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "X-Robots-Tag",
                        value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
                    },
                ],
            },
        ]
    },
}

export default nextConfig
