import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import BlogImage from './BlogImage'

const LINK_CLASS = 'text-blue-600 underline underline-offset-2 hover:text-blue-800'

export const mdxComponents: MDXComponents = {
    BlogImage,
    table: (props) => (
        <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm" {...props} />
        </div>
    ),
    th: (props) => (
        <th
            className="border border-gray-200 bg-gray-50 px-4 py-2 text-left font-semibold"
            {...props}
        />
    ),
    td: (props) => (
        <td className="border border-gray-200 px-4 py-2" {...props} />
    ),
    blockquote: (props) => (
        <blockquote
            className="my-4 rounded-lg border-l-4 border-blue-400 bg-blue-50 px-4 py-3 text-blue-900"
            {...props}
        />
    ),
    h2: (props) => (
        <h2 className="mb-3 mt-10 text-xl font-bold text-gray-900 sm:text-2xl" {...props} />
    ),
    h3: (props) => (
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-900" {...props} />
    ),
    p: (props) => (
        <p className="my-3 leading-7 text-gray-700" {...props} />
    ),
    ul: (props) => (
        <ul className="my-3 list-disc pl-5 text-gray-700 space-y-1" {...props} />
    ),
    ol: (props) => (
        <ol className="my-3 list-decimal pl-5 text-gray-700 space-y-1" {...props} />
    ),
    hr: () => <hr className="my-8 border-gray-200" />,
    strong: (props) => <strong className="font-semibold text-gray-900" {...props} />,
    a: ({ href = '', ...props }) => {
        // 내부 링크(/, #)는 같은 탭 클라이언트 내비게이션, 외부 링크는 새 탭
        const isInternal = href.startsWith('/') || href.startsWith('#')
        if (isInternal) {
            return <Link href={href} className={LINK_CLASS} {...props} />
        }
        return (
            <a
                href={href}
                className={LINK_CLASS}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
            />
        )
    },
}
