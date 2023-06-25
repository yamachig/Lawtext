import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
    logo: <span>Lawtext documentation</span>,
    head: () => null,
    editLink: { component: () => null },
    feedback: { content: () => null },
    footer: { text: () => null },
    faviconGlyph: "L",
    gitTimestamp: () => null,
    useNextSeoProps: () => ({ titleTemplate: "%s - Lawtext" }),
};

export default config;
