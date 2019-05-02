"use strict";

import { inspect, isString } from "util";
import { DOMParser } from "xmldom";
import * as std from "./std_law";

export const wait = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function* range(start: number, end: number) {
    for (let i = start; i < end; i++) {
        yield i;
    }
}

const NodeType = {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
};

export interface JsonEL {
    tag: string
    attr: { [key: string]: string | undefined }
    children: Array<JsonEL | string>
}

export const isJsonEL = (object: any): object is JsonEL => {
    return 'tag' in object && 'attr' in object && 'children' in object;
}

export const wrapXML = (el: JsonEL, inner: string): string => {
    const attr = Object.keys(el.attr).map(key => ` ${key}="${el.attr[key]}"`).join("");
    if (inner) {
        return `<${el.tag}${attr}>${inner}</${el.tag}>`;
    } else {
        return `<${el.tag}${attr}/>`;
    }
}

export const outerXML = (el: JsonEL, withControlEl: boolean = false): string => {
    const inner = innerXML(el, withControlEl);
    if (withControlEl || el.tag[0] !== "_") {
        return wrapXML(el, inner);
    } else {
        return inner;
    }
}

export const innerXML = (el: JsonEL, withControlEl: boolean = false): string => {
    if (!el.children) console.error(el);
    return el.children.map(child =>
        (child instanceof String || (typeof child === "string"))
            ? child
            : outerXML(child, withControlEl)
    ).join("");
}


let currentID = 0;
export class EL implements JsonEL {
    public tag: string
    public attr: { [key: string]: string | undefined }
    public children: Array<EL | string>
    public textCache: string | null
    public id: number

    constructor(tag: string, attr: { [key: string]: string | undefined } = {}, children: Array<EL | string> = []) {
        // if(!tag) {
        //     error(`${JSON.stringify(tag)} is invalid tag.`);
        // }
        this.tag = tag;
        this.attr = attr;
        this.children = children;

        this.textCache = null;
        this.id = ++currentID;
    }

    get isControl(): boolean {
        return this.tag[0] === "_";
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

    public json(withControlEl: boolean = false): JsonEL {
        const children: Array<JsonEL | string> = [];
        for (const el of this.children) {
            if (!(el instanceof EL || isString(el))) {
                console.error("[EL.json]", JSON.stringify(this));
                throw JSON.stringify(this);
            }
            if (isString(el)) {
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
            if (isString(last)) {
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

    public wrapXML(inner: string) {
        return wrapXML(this, inner);
    }

    public outerXML(withControlEl: boolean = false) {
        return outerXML(this, withControlEl);
    }

    public innerXML(withControlEl: boolean = false) {
        return innerXML(this, withControlEl);
    }

    public replaceSpan(start: number, end: number/* half open */, replChildren: Array<EL | string> | EL | string) {
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

export enum ContainerType {
    ROOT,
    TOPLEVEL,
    ARTICLES,
    SPANS,
}

export class Container {
    public el: EL
    public type: ContainerType
    public spanRange: [number, number] // half open
    public parent: Container | null
    public children: Container[]

    public subParent: Container | null
    public subChildren: Container[]

    constructor(
        el: EL,
        type: ContainerType,
        spanRange: [number, number] = [NaN, NaN],
        parent: Container | null = null,
        children: Container[] = [],
        subParent: Container | null = null,
        subChildren: Container[] = [],
    ) {
        this.el = el;
        this.type = type;
        this.spanRange = spanRange;
        this.parent = parent;
        this.children = children;
        this.subParent = subParent;
        this.subChildren = subChildren;
    }

    public addChild(child: Container): Container {
        this.children.push(child);
        child.parent = this;
        if (child.type !== ContainerType.ARTICLES) {
            const subParent = this.type !== ContainerType.ARTICLES
                ? this
                : this.closest(container => container.type !== ContainerType.ARTICLES);
            if (!subParent) throw new Error();
            subParent.subChildren.push(child);
            child.subParent = subParent;
        }
        return this;
    }

    public thisOrClosest(func: (container: Container) => boolean): Container | null {
        if (func(this)) return this;
        return this.parents(func).next().value || null;
    }

    public closest(func: (container: Container) => boolean): Container | null {
        return this.parents(func).next().value || null;
    }

    public *parents(func?: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.parent) return;
        if (!func || func(this.parent)) yield this.parent;
        yield* this.parent.parents(func);
    }

    public linealAscendant(func?: (container: Container) => boolean): Container[] {
        const ret = [...this.parents(func)].reverse();
        if (!func || func(this)) ret.push(this);
        return ret;
    }

    public findAncestorChildren(func: (container: Container) => boolean): Container | null {
        return this.ancestorChildren(func).next().value || null;
    }

    public *ancestorChildren(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.parent) return;
        yield* this.parent.children.filter(func);
        yield* this.parent.ancestorChildren(func);
    }

    public next(func: (container: Container) => boolean): Container | null {
        return this.nextAll(func).next().value || null;
    }

    public *nextAll(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.parent) return;
        for (let i = this.parent.children.indexOf(this) + 1; i < this.parent.children.length; i++) {
            const sibling = this.parent.children[i];
            if (func(sibling)) yield sibling;
        }
    }

    public prev(func: (container: Container) => boolean): Container | null {
        return this.prevAll(func).next().value || null;
    }

    public *prevAll(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.parent) return;
        for (let i = this.parent.children.indexOf(this) - 1; 0 <= i; i--) {
            const sibling = this.parent.children[i];
            if (func(sibling)) yield sibling;
        }
    }

    public thisOrClosestSub(func: (container: Container) => boolean): Container | null {
        if (func(this)) return this;
        return this.parentsSub(func).next().value || null;
    }

    public closestSub(func: (container: Container) => boolean): Container | null {
        return this.parentsSub(func).next().value || null;
    }

    public *parentsSub(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.subParent) return;
        if (func(this.subParent)) yield this.subParent;
        yield* this.subParent.parentsSub(func);
    }

    public findAncestorChildrenSub(func: (container: Container) => boolean): Container | null {
        return this.ancestorChildrenSub(func).next().value || null;
    }

    public *ancestorChildrenSub(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.subParent) return;
        yield* this.subParent.subChildren.filter(func);
        yield* this.subParent.ancestorChildrenSub(func);
    }

    public nextSub(func: (container: Container) => boolean): Container | null {
        return this.nextAllSub(func).next().value || null;
    }

    public *nextAllSub(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.subParent) return;
        for (let i = this.subParent.subChildren.indexOf(this) + 1;
            i < this.subParent.subChildren.length; i++) {
            const sibling = this.subParent.subChildren[i];
            if (func(sibling)) yield sibling;
        }
    }

    public prevSub(func: (container: Container) => boolean): Container | null {
        return this.prevAllSub(func).next().value || null;
    }

    public *prevAllSub(func: (container: Container) => boolean): IterableIterator<Container> {
        if (!this.subParent) return;
        for (let i = this.subParent.subChildren.indexOf(this) - 1; 0 <= i; i--) {
            const sibling = this.subParent.subChildren[i];
            if (func(sibling)) yield sibling;
        }
    }

    public find(
        func?: (container: Container) => boolean,
        cut?: (container: Container) => boolean,
    ): Container | null {
        return this.findAll(func, cut).next().value || null;
    }

    public *findAll(
        func?: (container: Container) => boolean,
        cut?: (container: Container) => boolean,
    ): IterableIterator<Container> {
        for (const child of this.children) {
            if (cut && cut(child)) return;
            if (!func || func(child)) yield child;
            yield* child.findAll(func, cut);
        }
    }

    public *iterate(
        func?: (container: Container) => boolean,
        cut?: (container: Container) => boolean,
    ): IterableIterator<Container> {
        if (cut && cut(this)) return;
        if (!func || func(this)) yield this;
        for (const child of this.children) yield* child.iterate(func, cut);
    }

    public *iterateReverse(
        func?: (container: Container) => boolean,
        cut?: (container: Container) => boolean,
    ): IterableIterator<Container> {
        if (cut && cut(this)) return;
        for (let i = this.children.length - 1; 0 <= i; i--) {
            const child = this.children[i];
            yield* child.iterateReverse(func, cut);
        }
        if (!func || func(this)) yield this;
    }
}

export class Env {
    public lawType: string
    public parents: EL[]

    private containerCache: Container | null

    constructor(
        lawType: string,
        container: Container | null = null,
        parents: EL[] = [],
    ) {
        this.lawType = lawType;
        this.containerCache = container;
        this.parents = parents;
    }

    get container(): Container {
        if (!this.containerCache) throw new Error();
        return this.containerCache;
    }

    set container(container: Container) {
        this.containerCache = container;
    }

    public addContainer(container: Container) {
        if (this.containerCache) {
            this.containerCache.addChild(container);
        }
        this.containerCache = container;
    }

    public copy() {
        return new Env(
            this.lawType,
            this.containerCache,
            this.parents.slice(),
        );
    }
}

export class Span {
    public index: number
    public el: EL
    public env: Env
    public text: string
    constructor(index: number, el: EL, env: Env) {
        this.index = index;
        this.el = el;
        this.env = env;

        this.text = el.text;
    }
}

export const loadEl = (rawLaw: JsonEL | string): EL | string => {
    if (isString(rawLaw)) {
        return rawLaw;
    } else {
        if (!rawLaw.children) {
            console.error("[load_el]", rawLaw);
        }
        return new EL(
            rawLaw.tag,
            rawLaw.attr,
            rawLaw.children.map(loadEl),
        );
    }
}


export class __Parentheses extends EL {

    public content: string

    constructor(type: string, depth: number, start: string, end: string, content: Array<string | EL>, text: string) {
        super("__Parentheses");

        this.attr.type = type;
        this.attr.depth = `${depth}`;
        this.append(new EL("__PStart", { type }, [start]));
        this.extend([new EL("__PContent", { type }, content)]);
        this.append(new EL("__PEnd", { type }, [end]));

        this.content = text.slice(start.length, text.length - end.length);
    }
};


export class __Text extends EL {

    constructor(text: string) {
        super("__Text", {}, [text]);
    }
};

export const elementToJson = (el: Element): EL => {
    const children: Array<EL | string> = [];
    for (const node of Array.from(el.childNodes)) {
        if (node.nodeType === NodeType.TEXT_NODE) {
            const text = (node.nodeValue || "").trim();
            if (text) {
                children.push(text);
            }
        } else if (node.nodeType === NodeType.ELEMENT_NODE) {
            children.push(elementToJson(node as Element));
        } else {
            // console.log(node);
        }
    }
    const attr = {};
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



export const paragraphItemTags = [
    'Paragraph', 'Item',
    'Subitem1', 'Subitem2', 'Subitem3',
    'Subitem4', 'Subitem5', 'Subitem6',
    'Subitem7', 'Subitem8', 'Subitem9',
    'Subitem10',
];

export const paragraphItemTitleTags = [
    'ParagraphNum', 'ItemTitle',
    'Subitem1Title', 'Subitem2Title', 'Subitem3Title',
    'Subitem4Title', 'Subitem5Title', 'Subitem6Title',
    'Subitem7Title', 'Subitem8Title', 'Subitem9Title',
    'Subitem10Title',
];

export const paragraphItemSentenceTags = [
    'ParagraphSentence', 'ItemSentence',
    'Subitem1Sentence', 'Subitem2Sentence', 'Subitem3Sentence',
    'Subitem4Sentence', 'Subitem5Sentence', 'Subitem6Sentence',
    'Subitem7Sentence', 'Subitem8Sentence', 'Subitem9Sentence',
    'Subitem10Sentence',
];





export const listTags = [
    'List', 'Sublist1', 'Sublist2', 'Sublist3',
];




export const getLawtype = (text: string): string | null => {
    if (text.match(/^憲法/)) return "Constitution";
    else if (text.match(/^法律/)) return "Act";
    else if (text.match(/^政令/)) return "CabinetOrder";
    else if (text.match(/^勅令/)) return "ImperialOrder";
    else if (text.match(/^^\S*[^政勅]令/)) return "MinisterialOrdinance";
    else if (text.match(/^\S*規則/)) return "Rule";
    else return null;
}

export const eras = {
    '明治': 'Meiji', '大正': 'Taisho',
    '昭和': 'Showa', '平成': 'Heisei',
    '令和': 'Reiwa',
};


export const articleGroupTypeChars = "編章節款目";

export const articleGroupType = {
    '編': 'Part', '章': 'Chapter', '節': 'Section',
    '款': 'Subsection', '目': 'Division',
    '条': 'Article', '項': 'Paragraph', '号': 'Item', '則': 'SupplProvision',
};

export const articleGroupTitleTag = {
    '編': 'PartTitle', '章': 'ChapterTitle', '節': 'SectionTitle',
    '款': 'SubsectionTitle', '目': 'DivisionTitle', '条': 'ArticleTitle',
    '則': 'SupplProvisionLabel'
};

export const reKanjiNum = /((\S*)千)?((\S*)百)?((\S*)十)?(\S*)/;

export const parseKanjiNum = (text: string): string | null => {
    const m = text.match(reKanjiNum);
    if (m) {
        const d1000 = m[1] ? kanjiDigits[m[2]] || 1 : 0;
        const d100 = m[3] ? kanjiDigits[m[4]] || 1 : 0;
        const d10 = m[5] ? kanjiDigits[m[6]] || 1 : 0;
        const d1 = kanjiDigits[m[7]] || 0;
        return "" + (d1000 * 1000 + d100 * 100 + d10 * 10 + d1);
    }
    return null;
}

export const kanjiDigits = {
    '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4,
    '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
};

export const reNamedNum = /^(○?)第?([一二三四五六七八九十百千]+)\S*?([のノ一二三四五六七八九十百千]*)$/;
export const irohaChars = "イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン";
export const reIrohaChar = /[イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン]/;
export const aiuChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨララリルレロワヲン";
export const reAiuChar = /[アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨララリルレロワヲン]/;
export const reItemNum = /^\D*(\d+)\D*$/;

export const parseRomanNum = (text: string): number => {
    let num = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1] || "";
        if (char.match(/[iIｉＩ]/)) {
            if (nextChar.match(/[xXｘＸ]/)) num -= 1;
            else num += 1;
        }
        if (char.match(/[xXｘＸ]/)) {
            num += 10;
        }
    }
    return num;
}

export const reWideDigits: Array<[RegExp, string]> = [
    [/０/g, '0'], [/１/g, '1'], [/２/g, '2'], [/３/g, '3'], [/４/g, '4'],
    [/５/g, '5'], [/６/g, '6'], [/７/g, '7'], [/８/g, '8'], [/９/g, '9'],
];

export const replaceWideNum = (text: string): string => {
    let ret = text;

    for (const [reWide, narrow] of reWideDigits) {
        ret = ret.replace(reWide, narrow);
    }
    return ret;
}

export enum KanaMode {
    Iroha = "Iroha",
    Aiu = "Aiu",
}

export const parseNamedNum = (text: string, kanaMode: KanaMode = KanaMode.Iroha): string => {
    const numsGroup: string[] = [];

    const subtexts = text
        .split(/\s+/)[0]
        .replace("及び", "、")
        .replace("から", "、")
        .replace("まで", "")
        .replace("～", "、")
        .replace("・", "、")
        .split("、");

    for (const subtext of subtexts) {

        let m = subtext.match(reNamedNum);
        if (m) {
            const nums = [parseKanjiNum(m[2])];
            if (m[3]) {
                const bs = m[3].split(/[のノ]/g);
                for (const b of bs) {
                    if (!b) continue;
                    nums.push(parseKanjiNum(b));
                }
            }
            numsGroup.push(nums.join('_'));
            continue;
        }

        if (kanaMode === KanaMode.Iroha) {
            m = subtext.match(reIrohaChar);
            if (m) {
                numsGroup.push(String(irohaChars.indexOf(m[0]) + 1));
                continue;
            }

        } else if (kanaMode === KanaMode.Aiu) {
            m = subtext.match(reAiuChar);
            if (m) {
                numsGroup.push(String(aiuChars.indexOf(m[0]) + 1));
                continue;
            }

        } else { throw assertNever(kanaMode); }

        const replacedSubtext = replaceWideNum(subtext);
        m = replacedSubtext.match(reItemNum);
        if (m) {
            numsGroup.push(m[1]);
            continue;
        }

        const romanNum = parseRomanNum(replacedSubtext);
        if (romanNum !== 0) {
            numsGroup.push(String(romanNum));
        }
    }

    return numsGroup.join(':');
}

export const setItemNum = (els: EL[]) => {
    const items: Array<std.Item | std.Subitem1 | std.Subitem2 | std.Subitem3 | std.Subitem4 | std.Subitem5 | std.Subitem6 | std.Subitem7 | std.Subitem8 | std.Subitem9 | std.Subitem10> = [];

    for (const el of els) {
        if (std.isItem(el) || std.isSubitem1(el) || std.isSubitem2(el) || std.isSubitem3(el) || std.isSubitem4(el) || std.isSubitem5(el) || std.isSubitem6(el) || std.isSubitem7(el) || std.isSubitem8(el) || std.isSubitem9(el) || std.isSubitem10(el)) {
            items.push(el);
        }
    }

    if (items.length) {
        let kanaMode = KanaMode.Iroha;
        for (const child of items[0].children) {
            if (child.tag === "ItemTitle" || child.tag ===
                "Subitem1Title" || child.tag === "Subitem2Title" || child.tag === "Subitem3Title" || child.tag === "Subitem4Title" || child.tag ===
                "Subitem5Title" || child.tag === "Subitem6Title" || child.tag === "Subitem7Title" || child.tag === "Subitem8Title" || child.tag ===
                "Subitem9Title" || child.tag === "Subitem10Title") {
                if (child.text.match(/ア/)) {
                    kanaMode = KanaMode.Aiu;
                    break;
                }
            }
        }
        for (const item of items) {
            let paragraphItemTitle = "";
            for (const child of item.children) {
                if (child.tag === "ItemTitle" || child.tag ===
                    "Subitem1Title" || child.tag === "Subitem2Title" || child.tag === "Subitem3Title" || child.tag === "Subitem4Title" || child.tag ===
                    "Subitem5Title" || child.tag === "Subitem6Title" || child.tag === "Subitem7Title" || child.tag === "Subitem8Title" || child.tag ===
                    "Subitem9Title" || child.tag === "Subitem10Title") {
                    paragraphItemTitle = child.text;
                    break;
                }
            }
            const num = parseNamedNum(paragraphItemTitle, kanaMode);
            if (num) {
                item.attr.Num = num;
            }
        }
    }
}

export enum RelPos {
    PREV,
    HERE,
    NEXT,
    SAME,
    NAMED,
}
export const isRelPos = (object: any): object is RelPos => {
    return (
        object === RelPos.PREV ||
        object === RelPos.HERE ||
        object === RelPos.NEXT ||
        object === RelPos.NAMED
    );
}

export class PointerFragment {
    public relPos: RelPos
    public tag: string
    public name: string
    public num: string | null
    public locatedContainer: Container | null

    constructor(
        relPos: RelPos,
        tag: string,
        name: string,
        num: string | null,
        locatedContainer: Container | null = null,
    ) {
        this.relPos = relPos;
        this.tag = tag;
        this.name = name;
        this.num = num;
        this.locatedContainer = locatedContainer;
    }

    public copy() {
        return new PointerFragment(
            this.relPos,
            this.tag,
            this.name,
            this.num,
            this.locatedContainer,
        );
    }
}

export type Pointer = PointerFragment[];
export type Range = [Pointer, Pointer]; // closed
export type Ranges = Range[];


export class NotImplementedError extends Error {
    constructor(message: string) {
        super(`NotImplemented: ${message}`)
    }
}

export const throwError = (): never => {
    throw new Error();
}

export const assertNever = (x: never): never => {
    throw new Error(`Unexpected ${typeof x} object: \r\n${inspect(x)}`);
}
