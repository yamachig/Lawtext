import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const HeadComponent = () => {
    const src = "/static/lawtext_bundles/browser/lawtext.js";
    const fallbackSrc = "https://yamachig.github.io/Lawtext/static/lawtext_bundles/browser/lawtext.js";
    React.useEffect(() => {
        import(/*webpackIgnore: true*/ src)
            .catch(() => {
                return import(/*webpackIgnore: true*/ fallbackSrc);
            })
            .catch(console.error);
    }, []);
    return null;
};

const config: DocsThemeConfig = {
    logo: <span>Lawtext documentation</span>,
    head: HeadComponent,
    editLink: { component: () => null },
    feedback: { content: () => null },
    footer: { text: () => (<div><small>
        &copy; 2017-{new Date().getFullYear()} <a href="https://github.com/yamachig/" target="_blank" rel="noreferrer">yamachi</a>
    </small></div>) },
    faviconGlyph: "L",
    gitTimestamp: () => null,
    useNextSeoProps: () => ({ titleTemplate: "%s - Lawtext" }),
    nextThemes: {
        defaultTheme: "light",
    },
};

export default config;
