"use client";

import "nextra-theme-docs/style.css";
import React from "react";
import { useRouter } from "next/compat/router.js";

const HeadComponent = () => {
    const router = useRouter();
    const src = `${router?.basePath ?? ""}/static/lawtext_bundles/browser/lawtext.js`;
    const fallbackSrc = "https://yamachig.github.io/Lawtext/static/lawtext_bundles/browser/lawtext.js";
    React.useEffect(() => {
        (async () => {
            // @ts-expect-error assign to globalThis
            globalThis.lawtext = (await import(/*webpackIgnore: true*/ src)
                .catch(() => {
                    return import(/*webpackIgnore: true*/ fallbackSrc);
                })
                .catch(console.error)).default;
        })();
    }, [src]);
    return null;
};
export default HeadComponent;
