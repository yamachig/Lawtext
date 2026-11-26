import type { JsonEL } from "./jsonEL.ts";

const xmlReplacers: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "\"": "&quot;",
    "'": "&apos;",
};

export type ControlElFilter = Readonly<Record<string, readonly string[]>>;

export type WithControlEl = boolean | ControlElFilter;

export const filterControlEl = (
    el: Pick<JsonEL, "tag" | "attr">,
    withControlEl: WithControlEl,
): JsonEL["attr"] | null => {
    if (el.tag[0] !== "_") return el.attr;
    if (withControlEl === true) return el.attr;
    if (withControlEl === false) return null;
    if (!Object.prototype.hasOwnProperty.call(withControlEl, el.tag)) return null;
    const attr: JsonEL["attr"] = {};
    for (const key of withControlEl[el.tag]) {
        if (key in el.attr && el.attr[key] !== undefined) attr[key] = el.attr[key];
    }
    return attr;
};

export const wrapXML = (el: Pick<JsonEL, "tag" | "attr">, inner: string): string => {
    const attr = Object.keys(el.attr)
        .map(key => ` ${key}="${el.attr[key]?.replace(/[<>&"']/g, c => xmlReplacers[c]) ?? ""}"`)
        .join("");
    if (inner) {
        return `<${el.tag}${attr}>${inner}</${el.tag}>`;
    } else {
        return `<${el.tag}${attr}/>`;
    }
};

export const outerXML = (el: JsonEL, withControlEl: WithControlEl = false): string => {
    const inner = innerXML(el, withControlEl);
    const attr = filterControlEl(el, withControlEl);
    if (attr !== null) {
        return wrapXML({ tag: el.tag, attr }, inner);
    } else {
        return inner;
    }
};

export const innerXML = (el: JsonEL, withControlEl: WithControlEl = false): string => {
    if (!el.children) console.error(el);
    return el.children.map(child =>
        (typeof child === "string")
            ? child.replace(/[<>&"']/g, c => xmlReplacers[c])
            : outerXML(child, withControlEl),
    ).join("");
};
