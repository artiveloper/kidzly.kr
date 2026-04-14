import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "키즐리 — 우리 아이 어린이집 찾기",
        short_name: "키즐리",
        description: "지도 기반으로 내 주변 어린이집을 빠르게 찾아보세요.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
        ],
    }
}
