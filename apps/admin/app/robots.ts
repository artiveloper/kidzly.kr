// 관리자 사이트 전체를 검색엔진 색인에서 제외한다
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            disallow: '/',
        },
    }
}
