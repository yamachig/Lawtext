import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../../mdx-components";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateMetadata(props: any) {
    const params = await props.params;
    const { metadata } = await importPage(params.mdxPath);
    return metadata;
}

const Wrapper = getMDXComponents().wrapper;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Page(props: any) {
    const params = await props.params;
    const {
        default: MDXContent,
        toc,
        metadata,
        sourceCode,
    } = await importPage(params.mdxPath);
    return (
        <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode} data-pagefind-body>
            <MDXContent {...props} params={params} />
        </Wrapper>
    );
}
