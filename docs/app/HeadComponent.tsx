"use client";

import "nextra-theme-docs/style.css";
import React from "react";
import { useRouter } from "next/compat/router";

const HeadComponent = () => {
    const router = useRouter();
    const src = `${router?.basePath ?? ""}/static/lawtext_bundles/browser/lawtext.js`;
    const fallbackSrc = "https://yamachig.github.io/Lawtext/static/lawtext_bundles/browser/lawtext.js";
    React.useEffect(() => {
        import(/*webpackIgnore: true*/ src)
            .catch(() => {
                return import(/*webpackIgnore: true*/ fallbackSrc);
            })
            .catch(console.error);
    }, [src]);
    return null;
};
export default HeadComponent;
