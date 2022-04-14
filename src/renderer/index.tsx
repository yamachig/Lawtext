import React from "react";
import { EL, JsonEL, loadEl } from "../node/el";
import * as std from "../law/std";
import { DOCXLaw, HTMLLaw } from "./rules/law";
import { AnyELProps, DOCXAnyEL, HTMLAnyEL } from "./rules/any";
import htmlCSS from "./rules/htmlCSS";
import { renderToStaticMarkup } from "./rules/common";
import { renderDocxAsync as innerRenderDocxAsync } from "./rules/docx";


export const renderDocxAsync = (elOrJsonEL: JsonEL | EL): Promise<Uint8Array | Buffer> => {
    const el = loadEl(elOrJsonEL);
    const element = std.isLaw(el)
        ? <DOCXLaw el={el} indent={0} docxOptions={{}} />
        : <DOCXAnyEL {...({ el, indent: 0 } as AnyELProps)} docxOptions={{}}/>;
    return innerRenderDocxAsync(element);
};

export const renderXml = (elOrJsonEL: JsonEL | EL, withControlEl = false): string => {
    const el = loadEl(elOrJsonEL);
    const xml = `\
<?xml version="1.0" encoding="utf-8"?>
${el.outerXML(withControlEl)}
`;
    return xml;
};


export const renderHtml = (elOrJsonEL: JsonEL | EL): string => {
    const rendered = renderHtmlfragment(elOrJsonEL);
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

export const renderHtmlfragment = (elOrJsonEL: JsonEL | EL): string => {
    const el = loadEl(elOrJsonEL);
    const element = std.isLaw(el)
        ? <HTMLLaw el={el} indent={0} htmlOptions={{}} />
        : <HTMLAnyEL {...({ el, indent: 0 } as AnyELProps)} htmlOptions={{}}/>;
    const rendered = renderToStaticMarkup(element);
    return rendered;
};

export const renderElementsFragment = (elements: (JsonEL | EL)[]): string => {
    return elements.map(renderHtmlfragment).join("\n");
};
