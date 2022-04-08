import { DOMParser } from "@xmldom/xmldom";

const NodeType = {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
};

export interface JsonEL {
    tag: string
    attr: { [key: string]: string | undefined }
    children: Array<JsonEL | string>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const isJsonEL = (object: any): object is JsonEL => {
    return "tag" in object && "attr" in object && "children" in object;
};

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


let currentID = 0;
export class EL implements JsonEL {
    public tag: string;
    public attr: { [key: string]: string | undefined };
    public children: Array<EL | string>;
    public textCache: string | null;
    public id: number;

    public range: [start: number, end: number] | null;

    constructor(
        tag: string,
        attr: { [key: string]: string | undefined } = {},
        children: Array<EL | string> = [],
        range: [start: number, end: number] | null = null,
    ) {
        // if(!tag) {
        //     error(`${JSON.stringify(tag)} is invalid tag.`);
        // }
        this.tag = tag;
        this.attr = attr;
        this.children = children;
        this.range = range;

        this.textCache = null;
        this.id = ++currentID;
    }

    get isControl(): boolean {
        return this.tag[0] === "_";
    }

    public copy(deep = true): EL {
        const el = new EL(
            this.tag,
            { ...this.attr },
            (
                deep
                    ? this.children.map(child => child instanceof EL ? child.copy(true) : child)
                    : [...this.children]
            ),
            this.range && [...this.range],
        );
        return el;
    }

    public append(child: EL | string): EL {
        if (child !== undefined && child !== null) {
            // if(!(child instanceof EL) && !(child instanceof String || (typeof child === "string"))) {
            //     error("child is not EL or String.");
            // }
            this.children.push(child);
            this.textCache = null;
        }
        return this;
    }

    public extend(children: Array<EL | string>): EL {
        // if(!Array.isArray(children)) {
        //     error(`${JSON.stringify(children).slice(0,100)} is not Array.`);
        // }
        // for(let i = 0; i < children.length; i++) {
        //     let child = children[i];
        //     if(!(child instanceof EL) && !(child instanceof String || (typeof child === "string"))) {
        //         error("child is not EL or String.");
        //     }
        // }
        this.children = this.children.concat(children);
        this.textCache = null;
        return this;
    }

    public json(withControlEl = false): JsonEL {
        const children: Array<JsonEL | string> = [];
        for (const el of this.children) {
            if (!(el instanceof EL || typeof el === "string")) {
                console.error("[EL.json]", JSON.stringify(this));
                throw JSON.stringify(this);
            }
            if (typeof el === "string") {
                children.push(el);
            } else {
                const js = el.json(withControlEl);
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
        return {
            tag: this.tag,
            attr: this.attr,
            children: joinedChildren,
        };
    }

    get text(): string {
        if (this.textCache === null) {
            this.textCache = this.children.map(child => child instanceof EL ? child.text : child).join("");
        }
        return this.textCache;
    }

    set text(t: string) {
        this.children = [t];
        this.textCache = null;
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
            const cEnd = cStart + (child instanceof EL ? child.text : child).length; // half open
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
                        this.textCache = null;
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

export const loadEl = <T extends JsonEL | string>(rawLaw: T): T extends string ? string : EL => {
    if (typeof rawLaw === "string") {
        return rawLaw as unknown as T extends string ? string : EL;
    } else {
        if (!rawLaw.children) {
            console.error("[load_el]", rawLaw);
        }
        return new EL(
            rawLaw.tag,
            rawLaw.attr,
            rawLaw.children.map(loadEl),
        ) as unknown as T extends string ? string : EL;
    }
};

export const elementToJson = (el: Element): EL => {
    const children: Array<EL | string> = [];
    for (const node of Array.from(el.childNodes)) {
        if (node.nodeType === NodeType.TEXT_NODE) {
            const text = (node.nodeValue || "")
                .replace(/^[ \r\n\t]+/, "")
                .replace(/[ \r\n\t]+$/, "");
            if (text) {
                children.push(text);
            }
        } else if (node.nodeType === NodeType.ELEMENT_NODE) {
            children.push(elementToJson(node as Element));
        } else {
            // console.log(node);
        }
    }
    const attr: Record<string, string> = {};
    for (const at of Array.from(el.attributes)) {
        attr[at.name] = at.value;
    }
    return new EL(
        el.tagName,
        attr,
        children,
    );
};

export const xmlToJson = (xml: string): EL => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xml, "text/xml");
    if (!dom.documentElement) throw new Error("never");
    return elementToJson(dom.documentElement);
};
