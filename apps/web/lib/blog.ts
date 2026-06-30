import { blog, type BlogPost } from '#site/content'

export type { BlogPost }
export type BlogPostMeta = Omit<BlogPost, 'code'>

// Sorted newest-first once at module load — velite resolves the data at build time.
const posts = [...blog].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))

export function getAllPosts(): BlogPostMeta[] {
    return posts.map(({ code: _code, ...meta }) => meta)
}

export function getPost(slug: string): BlogPost | null {
    // URLs arrive percent-encoded; macOS filenames are NFD — match velite's NFC slug
    const normalizedSlug = decodeURIComponent(slug).normalize('NFC')
    return posts.find((post) => post.slug === normalizedSlug) ?? null
}
