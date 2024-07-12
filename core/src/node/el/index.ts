import { innerXML, outerXML, wrapXML } from "./elToXML";
import type { JsonEL } from "./jsonEL";


let currentID = 0;

/**
 * EL: a simplified XML DOM functionality that implements {@link JsonEL} interface.
 */
export class EL implements JsonEL {
    public tag: string;
    public attr: { [key: string]: string | undefined };
    public children: Array<EL | string>;
    public id: number;
    public range: [start: number, end: number] | null;

    constructor(
        tag: string,
        attr: { [key: string]: string | undefined } = {},
        children: Array<EL | string> = [],
        range: [start: number, end: number] | null = null,
        id?: number,
    ) {
        // if(!tag) {
        //     error(`${JSON.stringify(tag)} is invalid tag.`);
        // }
        this.tag = tag;
        this.attr = attr;
        this.children = children;
        this.range = range;

        // this.textCache = null;
        this.id = id ?? ++currentID;
    }

    get isControl(): boolean {
        return this.tag[0] === "_";
    }

    public copy(deep = true, copyID = false): EL {
        const el = new EL(
            this.tag,
            { ...this.attr },
            (
                deep
                    ? this.children.map(child => child instanceof EL ? child.copy(true) : child)
                    : [...this.children]
            ),
            this.range && [...this.range],
            copyID ? this.id : undefined,
        );
        Object.setPrototypeOf(el, Object.getPrototypeOf(this));
        return el;
    }

    public json(withControlEl = false, withProperties = false): JsonEL {
        const children: Array<JsonEL | string> = [];
        for (const el of this.children) {
            if (!(el instanceof EL || typeof el === "string")) {
                console.error("[EL.json]", JSON.stringify(this));
                throw JSON.stringify(this);
            }
            if (typeof el === "string") {
                children.push(el);
            } else {
                const js = el.json(withControlEl, withProperties);
                if (withControlEl || el.tag[0] !== "_") {
                    children.push(js);
                } else {
                    children.push(...js.children);
                }
            }
        }
        const joinedChildren: Array<JsonEL | string> = [];
        for (const child of children) {
            const last = joinedChildren[joinedChildren.length - 1];
            if (typeof last === "string" && typeof child === "string") {
                joinedChildren[joinedChildren.length - 1] = last + child;
            } else {
                joinedChildren.push(child);
            }
        }
        const attr = { ...this.attr };
        if (withProperties) {
            attr["__id"] = JSON.stringify(this.id);
            attr["__range"] = JSON.stringify(this.range);
        }
        return {
            tag: this.tag,
            attr,
            children: joinedChildren,
        };
    }

    public text(): string {
        if (this.children.length === 0) return "";
        if (this.children.length === 1 && typeof this.children[0] === "string") return this.children[0];
        return this.children.map(child => child instanceof EL ? child.text() : child).join("");
    }

    public wrapXML(inner: string): string {
        return wrapXML(this, inner);
    }

    public outerXML(withControlEl = false): string {
        return outerXML(this, withControlEl);
    }

    public innerXML(withControlEl = false): string {
        return innerXML(this, withControlEl);
    }
}

export const rangeOfELs = (els: unknown[]): [start: number, end: number] | null => {
    let start = null as number | null;
    let end = null as number | null;
    for (const el of els) {
        if (el instanceof EL) {
            const r = el.range ?? rangeOfELs(el.children);
            if (r) {
                start = Math.min(r[0], start ?? r[0]);
                end = Math.max(r[1], end ?? r[1]);
            }
        }
    }
    return (start !== null && end !== null) ? [start, end] : null;
};
