import * as runtime from 'react/jsx-runtime'
import { mdxComponents } from './mdx-components'

// Velite's s.mdx() compiles each post body to a function-body string that reads
// its JSX runtime from arguments[0] and returns { default: MDXContent }.
function getMDXComponent(code: string) {
    const fn = new Function(code)
    return fn(runtime).default as (props: {
        components?: typeof mdxComponents
    }) => React.ReactElement
}

type Props = {
    code: string
}

export default function MDXContent({ code }: Props) {
    const Component = getMDXComponent(code)
    return <Component components={mdxComponents} />
}
