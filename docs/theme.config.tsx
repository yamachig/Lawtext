import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
    logo: <span>Lawtext documentation</span>,
    head: () => null,
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
