import { defineConfig, defineCollection, s } from 'velite'

/**
 * 한국어 본문 기준 읽기 시간(분)을 산출한다.
 *
 * 기준은 공백을 뺀 글자 수 ÷ 500이며 올림, 최소 1분이다. 500자/분은 한국어 성인 묵독 속도의
 * 통상 하한이고, 이 저장소 글은 표·인용이 많아 더 높은 값을 쓰면 과소 추정이 된다.
 *
 * frontmatter로 받지 않고 여기서 계산하는 이유는, 사람이나 에이전트가 매번 다르게 추정해
 * 같은 분량의 글에 서로 다른 값이 붙는 문제가 실제로 있었기 때문이다(2026-09-06 정리).
 */
function estimateReadingTime(body: string): number {
    const text = body
        // 코드블록·인라인코드
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        // 이미지는 alt까지 통째로 제외, 링크는 앵커 텍스트만 남긴다
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        // HTML 태그, 표 구분선, 마크다운 기호
        .replace(/<[^>]+>/g, '')
        .replace(/^\s*\|[\s|:-]+\|\s*$/gm, '')
        .replace(/[#>*_~|-]/g, '')

    const charCount = text.replace(/\s/g, '').length

    return Math.max(1, Math.ceil(charCount / 500))
}

const blog = defineCollection({
    name: 'BlogPost',
    pattern: 'blog/**/*.mdx',
    schema: s
        .object({
            uuid: s.string(),
            title: s.string(),
            description: s.string(),
            keywords: s.array(s.string()).default([]),
            category: s.string(),
            tags: s.array(s.string()).default([]),
            publishedAt: s.string(),
            // 제도·금액이 갱신될 때만 채운다. 비어 있으면 publishedAt을 최종 수정일로 본다
            updatedAt: s.string().optional(),
            thumbnail: s.string(),
            // s.path() yields the file path without extension, e.g. "blog/부모급여-총정리"
            slug: s.path(),
            // s.mdx() compiles the MDX body to a function-body code string at build time
            code: s.mdx(),
            // readingTime 산출에만 쓰고 출력에서는 제외한다 (하이드레이션 페이로드 최소화)
            raw: s.raw(),
        })
        .transform(({ raw, ...data }) => ({
            ...data,
            // strip the leading collection dir and normalize for Korean (NFD→NFC) filenames
            slug: data.slug.replace(/^blog\//, '').normalize('NFC'),
            readingTime: estimateReadingTime(raw),
        })),
})

export default defineConfig({
    root: 'content',
    output: {
        data: '.velite',
        assets: 'public/static',
        base: '/static/',
        name: '[name]-[hash:6].[ext]',
        clean: true,
    },
    collections: { blog },
})
