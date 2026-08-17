import { defineConfig, defineCollection, s } from 'velite'

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
            readingTime: s.number().default(3),
            thumbnail: s.string(),
            // s.path() yields the file path without extension, e.g. "blog/부모급여-총정리"
            slug: s.path(),
            // s.mdx() compiles the MDX body to a function-body code string at build time
            code: s.mdx(),
        })
        .transform((data) => ({
            ...data,
            // strip the leading collection dir and normalize for Korean (NFD→NFC) filenames
            slug: data.slug.replace(/^blog\//, '').normalize('NFC'),
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
