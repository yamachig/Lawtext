import { Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import React from "react";
import HeadComponent from "./HeadComponent";

const navbar = (
    <Navbar
        logo={<span>Lawtext documentation</span>}
    />
);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="ja"
            dir="ltr"
            suppressHydrationWarning
        >
            <Head
                faviconGlyph='L'
            >
                <HeadComponent />
            </Head>
            <body>
                <Layout
                    editLink={null}
                    copyPageButton={false}
                    search={false}
                    feedback={{ content: null }}
                    navbar={navbar}
                    pageMap={await getPageMap()}
                    footer={<div key="layout-footer"><small>
                      &copy; 2017-{new Date().getFullYear()} <a href="https://github.com/yamachig/" target="_blank" rel="noreferrer">yamachi</a>
                    </small></div>}
                >
                    {children}
                </Layout>
            </body>
        </html>
    );
}
