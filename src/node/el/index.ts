import { innerXML, outerXML, wrapXML } from "./elToXML";
import { JsonEL } from "./jsonEL";


let currentID = 0;
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

    public replaceSpan(start: number, end: number/* half open */, replChildren: Array<EL | string> | EL | string): void {
        if (!Array.isArray(replChildren)) {
            replChildren = [replChildren];
        }
        let nextCStart = 0;
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            const cStart = nextCStart;
            const cEnd = cStart + (child instanceof EL ? child.text() : child).length; // half open
            nextCStart = cEnd;

            if (cStart <= start && start < cEnd) {
                if (cStart < end && end <= cEnd) {
                    const startInChild = start - cStart;
                    const endInChild = end - cStart;

                    if (child instanceof EL) {
                        child.replaceSpan(startInChild, endInChild, replChildren);
                    } else {
                        let newChildren: Array<EL | string> = [];
                        if (0 < startInChild) newChildren.push(child.slice(0, startInChild));
                        newChildren = newChildren.concat(replChildren);
                        if (endInChild < child.length) newChildren.push(child.slice(endInChild));
                        newChildren = [
                            ...this.children.slice(0, i),
                            ...newChildren,
                            ...this.children.slice(i + 1),
                        ];
                        this.children = newChildren;
                    }
                } else {
                    throw new Error("Attempted to replace across elements.");
                }
                break;
            }
        }
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
