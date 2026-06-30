import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export type BlogPost = {
    slug: string
    title: string
    description: string
    keywords: string[]
    category: string
    tags: string[]
    publishedAt: string
    readingTime: number
    thumbnail: string
    content: string
}

export type BlogPostMeta = Omit<BlogPost, 'content'>

function parsePost(slug: string, raw: string): BlogPost {
    const { data, content } = matter(raw)
    return {
        slug,
        title: data.title ?? '',
        description: data.description ?? '',
        keywords: data.keywords ?? [],
        category: data.category ?? '',
        tags: data.tags ?? [],
        publishedAt: data.publishedAt ?? '',
        readingTime: data.readingTime ?? 3,
        thumbnail: data.thumbnail ?? '',
        content,
    }
}

// macOS HFS+ stores filenames in NFD; URLs use NFC — normalize to NFC for consistency
function normalizeSlug(s: string): string {
    return s.normalize('NFC')
}

export function getAllPosts(): BlogPostMeta[] {
    if (!fs.existsSync(BLOG_DIR)) return []
    const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
    return files
        .map((file) => {
            const slug = normalizeSlug(file.replace(/\.mdx$/, ''))
            const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
            const post = parsePost(slug, raw)
            const { content: _, ...meta } = post
            return meta
        })
        .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

export function getPost(slug: string): BlogPost | null {
    const normalizedSlug = normalizeSlug(decodeURIComponent(slug))
    const filePath = path.join(BLOG_DIR, `${normalizedSlug}.mdx`)
    if (!fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, 'utf-8')
    return parsePost(normalizedSlug, raw)
}
