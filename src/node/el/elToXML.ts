import { JsonEL } from "./jsonEL";

export const wrapXML = (el: JsonEL, inner: string): string => {
    const attr = Object.keys(el.attr).map(key => ` ${key}="${el.attr[key] ?? ""}"`).join("");
    if (inner) {
        return `<${el.tag}${attr}>${inner}</${el.tag}>`;
    } else {
        return `<${el.tag}${attr}/>`;
    }
};

export const outerXML = (el: JsonEL, withControlEl = false): string => {
    const inner = innerXML(el, withControlEl);
    if (withControlEl || el.tag[0] !== "_") {
        return wrapXML(el, inner);
    } else {
        return inner;
    }
};

export const innerXML = (el: JsonEL, withControlEl = false): string => {
    if (!el.children) console.error(el);
    return el.children.map(child =>
        (child instanceof String || (typeof child === "string"))
            ? child.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
            : outerXML(child, withControlEl),
    ).join("");
};
