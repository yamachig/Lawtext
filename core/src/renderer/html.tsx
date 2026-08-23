import React from "react";
import { EL } from "../node/el/index.ts";
import * as std from "../law/std/index.ts";
import { HTMLLaw } from "./rules/law.tsx";
import htmlCSS from "./rules/htmlCSS.tsx";
import { renderToStaticMarkup } from "./common/index.tsx";
import { HTMLAnyELs } from "./rules/any.tsx";
import type { HTMLOptions } from "./common/html.tsx";
import loadEL from "../node/el/loadEL.ts";
import type { JsonEL } from "../node/el/jsonEL.ts";

export const renderHTML = (elOrJsonEL: JsonEL | EL, htmlOptions?: HTMLOptions): string => {
    const rendered = renderHTMLfragment(elOrJsonEL, htmlOptions);
    const html = /*html*/`\
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
${htmlCSS}
</style>
</head>
<body>
${rendered}
</body>
</html>
`;
    return html;
};

export const renderHTMLfragment = (elOrJsonEL: JsonEL | EL, htmlOptions?: HTMLOptions): string => {
    const el = elOrJsonEL instanceof EL ? elOrJsonEL : loadEL(elOrJsonEL);
    const element = std.isLaw(el)
        ? <HTMLLaw el={el} indent={0} htmlOptions={htmlOptions ?? {}} />
        : <HTMLAnyELs els={[el as std.StdEL | std.__EL]} indent={0} htmlOptions={htmlOptions ?? {}}/>;
    const rendered = renderToStaticMarkup(element);
    return rendered;
};

export const renderElementsFragment = (elements: (JsonEL | EL)[], htmlOptions?: HTMLOptions): string => {
    return elements.map(e => renderHTMLfragment(e, htmlOptions)).join("\n");
};

export default renderHTML;
