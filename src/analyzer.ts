"use strict";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sha512 from "hash.js/lib/hash/sha/512";
import { LAWNUM_TABLE, KEY_LENGTH } from "./lawnum_table";
import * as parser from "./parser";
import * as util from "./util";
import { Container, ContainerType, EL, Env, RelPos, Span, throwError } from "./util";

export const getLawNameLength = (lawNum: string): number => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const digest = sha512().update(lawNum).digest("hex") as string;
    const key = parseInt(digest.slice(0, KEY_LENGTH), 16);
    return LAWNUM_TABLE[key];
};

const rootContainerTags = ["Law"];

const toplevelContainerTags = ["EnactStatement", "MainProvision", "AppdxTable", "AppdxStyle"];

const articleContainerTags = ["Part", "Chapter", "Section", "Subsection", "Division"];

const spanContainerTags = [
    "Article",
    "Paragraph",
    "Item",
    "Subitem1",
    "Subitem2",
    "Subitem3",
    "Subitem4",
    "Subitem5",
    "Subitem6",
    "Subitem7",
    "Subitem8",
    "Subitem9",
    "Subitem10",
    "Table",
    "TableRow",
    "TableColumn",
    "Sentence",
];

const containerTags = [
    ...rootContainerTags,
    ...toplevelContainerTags,
    ...articleContainerTags,
    ...spanContainerTags,
];

const getContainerType = (tag: string): ContainerType => {
    if (rootContainerTags.indexOf(tag) >= 0) return ContainerType.ROOT;
    else if (toplevelContainerTags.indexOf(tag) >= 0) return ContainerType.TOPLEVEL;
    else if (articleContainerTags.indexOf(tag) >= 0) return ContainerType.ARTICLES;
    else if (spanContainerTags.indexOf(tag) >= 0) return ContainerType.SPANS;
    else return ContainerType.SPANS;
};

const ignoreSpanTag = [
    "LawNum",
    "LawTitle",
    "TOC",
    "ArticleTitle",
    "ParagraphNum",
    "ItemTitle",
    "Subitem1Title",
    "Subitem2Title",
    "Subitem3Title",
    "Subitem4Title",
    "Subitem5Title",
    "Subitem6Title",
    "Subitem7Title",
    "Subitem8Title",
    "Subitem9Title",
    "Subitem10Title",
    "SupplProvision",
];

const extractSpans = (law: EL): [Span[], Container[], Container] => {

    const spans: Span[] = [];
    const containers: Container[] = [];

    let rootContainer: Container | null = null;

    const extract = (el: EL, origEnv: Env) => {

        if (!el.tag) return;

        if (ignoreSpanTag.indexOf(el.tag) >= 0) return;

        const env = origEnv.copy();

        let isMixed = false;
        for (const subel of el.children) {
            if (typeof subel === "string") {
                isMixed = true;
                break;
            }
        }

        if (isMixed && el.children.length !== 1) {
            console.warn(`unexpected mixed content! ${JSON.stringify(el)}`);
        }

        if (isMixed) {
            el.attr.span_index = String(spans.length);
            spans.push(new Span(spans.length, el, env));
            return;

        } else {
            env.parents.push(el);

            const isContainer = containerTags.indexOf(el.tag) >= 0;

            let container: Container | null = null;
            if (isContainer) {
                const type = getContainerType(el.tag);
                container = new Container(el, type);
                env.addContainer(container);
                containers.push(container);
                if (type === ContainerType.ROOT) rootContainer = container;
            }

            const startSpanIndex = spans.length;
            for (const subel of el.children) {
                if (typeof subel === "string") continue;
                extract(subel, env);
            }
            const endSpanIndex = spans.length; // half open

            if (container) container.spanRange = [startSpanIndex, endSpanIndex];
        }
    };

    extract(law, new Env(law.attr.LawType || ""));

    if (!rootContainer) throw new Error();

    return [spans, containers, rootContainer];
};

class Pos {
    public span: Span
    public spanIndex: number
    public textIndex: number
    public length: number
    public env: Env
    constructor(span: Span, spanIndex: number, textIndex: number, length: number, env: Env) {
        this.span = span;
        this.spanIndex = spanIndex;
        this.textIndex = textIndex;
        this.length = length;
        this.env = env;
    }
}

export class ____Declaration extends EL {
    public type: string
    public name: string
    public scope: ScopeRange[]
    public value: string | null
    public namePos: Pos
    constructor(type: string, name: string, value: string | null, scope: ScopeRange[], namePos: Pos) {
        super("____Declaration");

        this.type = type;
        this.name = name;
        this.value = value;
        this.scope = scope;
        this.namePos = namePos;

        this.attr.type = type;
        this.attr.name = name;
        if (value !== null) this.attr.value = value;
        this.attr.scope = JSON.stringify(scope);
        this.attr.name_pos = JSON.stringify({
            span_index: namePos.spanIndex,
            text_index: namePos.textIndex,
            length: namePos.length,
        });

        this.append(name);
    }
}

class ScopeRange {
    public startSpanIndex: number
    public startTextIndex: number
    public endSpanIndex: number
    public endTextIndex: number
    constructor(
        startSpanIndex: number,
        startTextIndex: number,
        endSpanIndex: number, // half open
        endTextIndex: number, // half open
    ) {
        this.startSpanIndex = startSpanIndex;
        this.startTextIndex = startTextIndex;
        this.endSpanIndex = endSpanIndex;
        this.endTextIndex = endTextIndex;
    }
}

class ____VarRef extends EL {
    public refName: string
    public declaration: ____Declaration
    public refPos: Pos
    constructor(refName: string, declaration: ____Declaration, refPos: Pos) {
        super("____VarRef");

        this.refName = refName;
        this.declaration = declaration;
        this.refPos = refPos;

        this.attr.ref_declaration_index = declaration.attr.declaration_index;

        this.append(refName);
    }
}

export class Declarations {
    public declarations: ____Declaration[]
    constructor() {
        this.declarations = [];
    }

    public getInSpan(spanIndex: number): ____Declaration[] {
        const declarations: ____Declaration[] = [];
        for (const declaration of this.declarations) {
            if (
                declaration.scope.some(range =>
                    range.startSpanIndex <= spanIndex &&
                    spanIndex < range.endSpanIndex,
                )
            ) {
                declarations.push(declaration);
            }
        }
        declarations.sort((a, b) => -(a.name.length - b.name.length));
        return declarations;
    }

    public add(declaration: ____Declaration): void {
        this.declarations.push(declaration);
    }

    get length(): number {
        return this.declarations.length;
    }

    public get(index: number): ____Declaration {
        return this.declarations[index];
    }
}

const parseRanges = (text: string): util.Ranges => { // closed
    if (text === "") return [];
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return parser.parse(text, { startRule: "ranges" });
    } catch (e) {
        console.warn(text, e);
        return [];
    }
};

const locatePointer = (
    origPointer: util.Pointer,
    prevPointer: util.Pointer | null,
    currentSpan: Span,
): util.Pointer => {

    let locatedPointer: util.Pointer;

    const head = origPointer[0];
    const headType = getContainerType(head.tag);
    const currentContainer = currentSpan.env.container;

    if (ignoreSpanTag.indexOf(head.tag) >= 0) {
        locatedPointer = origPointer;

    } else if (head.relPos === RelPos.SAME) {
        console.warn("RelPos.SAME is detected. Skipping:", currentSpan, origPointer);
        const copy = head.copy();
        copy.locatedContainer = currentContainer
            .thisOrClosest(c => c.type === ContainerType.TOPLEVEL);
        locatedPointer = [copy];

    } else if (
        head.relPos === RelPos.HERE ||
        head.relPos === RelPos.PREV ||
        head.relPos === RelPos.NEXT
    ) {
        const scopeContainer = currentContainer
            .thisOrClosest(c => c.el.tag === head.tag);

        if (scopeContainer) {
            head.locatedContainer =
                (head.relPos === RelPos.HERE)
                    ? scopeContainer
                    : (headType === ContainerType.ARTICLES)
                        ? (head.relPos === RelPos.PREV)
                            ? scopeContainer.prev(c => c.el.tag === head.tag)
                            : (head.relPos === RelPos.NEXT)
                                ? scopeContainer.next(c => c.el.tag === head.tag)
                                : throwError()
                        : (head.relPos === RelPos.PREV)
                            ? scopeContainer.prevSub(c => c.el.tag === head.tag)
                            : (head.relPos === RelPos.NEXT)
                                ? scopeContainer.nextSub(c => c.el.tag === head.tag)
                                : throwError();
        }

        locatedPointer = origPointer;

    } else {
        const foundIndex = prevPointer
            ? prevPointer.findIndex(fragment => fragment.tag === head.tag)
            : -1;
        if (
            prevPointer &&
            1 <= foundIndex
        ) {
            locatedPointer = [
                ...prevPointer.slice(0, foundIndex),
                ...origPointer,
            ];

        } else if (headType === ContainerType.TOPLEVEL) {
            head.locatedContainer = currentContainer.findAncestorChildrenSub(c => {
                if (c.el.tag !== head.tag) return false;
                const titleEl = c.el.children.find(el =>
                    el instanceof EL && el.tag === `${c.el.tag}Title`) as EL;
                return (new RegExp(`^${head.name}(?:[(（]|\\s|$)`)).exec(titleEl.text) !== null;
            });

            locatedPointer = origPointer;

        } else {
            const func = (c: Container) =>
                (
                    c.el.tag === head.tag ||
                    head.tag === "SUBITEM" && /^Subitem\d+$/.exec(c.el.tag) !== null
                ) &&
                (c.el.attr.Num || null) === head.num;
            head.locatedContainer =
                headType === ContainerType.ARTICLES
                    ? currentContainer.findAncestorChildren(func)
                    : currentContainer.findAncestorChildrenSub(func);

            locatedPointer = origPointer;
        }
    }

    if (locatedPointer[0].locatedContainer) {
        let parentContainer = locatedPointer[0].locatedContainer;
        for (const fragment of locatedPointer.slice(1)) {
            if (!parentContainer) break;
            // let fragment_rank = container_tags.indexOf(fragment.tag);
            // if (fragment_rank < 0) fragment_rank = Number.POSITIVE_INFINITY;
            fragment.locatedContainer =
                parentContainer.find(
                    c =>
                        (
                            (
                                c.el.tag === fragment.tag ||
                                fragment.tag === "SUBITEM" &&
                                /^Subitem\d+$/.exec(c.el.tag) !== null
                            ) &&
                            (c.el.attr.Num || null) === fragment.num
                        ) ||
                        fragment.tag === "PROVISO" &&
                        c.el.tag === "Sentence" &&
                        c.el.attr.Function === "proviso",
                    // c => fragment_rank < container_tags.indexOf(c.el.tag),
                );
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            parentContainer = fragment.locatedContainer!;
        }
    }

    return locatedPointer;
};

const locateRanges = (origRanges: util.Ranges, currentSpan: Span) => {
    const ranges: util.Ranges = [];

    let prevPointer: util.Pointer | null = null;
    for (const [origFrom, origTo] of origRanges) {
        const from = locatePointer(origFrom, prevPointer, currentSpan);
        prevPointer = from;
        let to: util.Pointer | null;
        if (origFrom === origTo) {
            to = from;
        } else {
            to = locatePointer(origTo, prevPointer, currentSpan);
            prevPointer = to;
        }
        ranges.push([from, to]);
    }

    return ranges;
};

const getScope = (currentSpan: Span, scopeText: string, following: boolean, followingIndex: number): ScopeRange[] => {
    const ret: ScopeRange[] = [];
    const ranges = locateRanges(parseRanges(scopeText), currentSpan);
    for (const [from, to] of ranges) {
        const fromc = from[from.length - 1].locatedContainer;
        const toc = to[to.length - 1].locatedContainer;
        if (fromc && toc) {
            if (following) {
                ret.push(new ScopeRange(followingIndex, 0, toc.spanRange[1], 0));
            } else {
                ret.push(new ScopeRange(fromc.spanRange[0], 0, toc.spanRange[1], 0));
            }
        } else {
            console.warn("Scope couldn't be detected:", { from, to });
        }
    }
    // console.log(scope_text, ranges, ret);
    return ret;
};


const detectLawname = (spans: Span[], spanIndex: number) => {
    if (spans.length <= spanIndex + 3) return null;
    const [
        lawnameSpan,
        startSpan,
        lawnumSpan,
    ] = spans.slice(spanIndex, spanIndex + 3);

    if (!(
        startSpan.el.tag === "__PStart" &&
        startSpan.el.attr.type === "round"
    )) return null;

    const match = /^(?:明治|大正|昭和|平成|令和)[元〇一二三四五六七八九十]+年\S+?第[〇一二三四五六七八九十百千]+号/.exec(lawnumSpan.text);
    if (!match) return null;

    const lawNum = match[0];
    const lawnameLength = getLawNameLength(lawNum);
    const lawnameTextIndex = lawnameSpan.text.length - lawnameLength;
    const lawName = lawnameSpan.text.slice(lawnameTextIndex);

    const lawnumEl = new EL("____LawNum", {}, [lawNum]);

    if (
        lawnumSpan.text.length <= lawNum.length &&
        lawnumSpan.index + 1 < spans.length
    ) {

        const afterSpan = spans[lawnumSpan.index + 1];

        if (
            afterSpan.el.tag === "__PEnd" &&
            afterSpan.el.attr.type === "round"
        ) {
            const scope = [
                new ScopeRange(
                    afterSpan.index + 1,
                    0,
                    spans.length, // half open
                    0, // half open
                ),
            ];

            const namePos = new Pos(
                lawnameSpan,       // span
                lawnameSpan.index, // span_index
                lawnameTextIndex, // text_index
                lawnameLength,     // length
                lawnameSpan.env,   // env
            );

            const declaration = new ____Declaration(
                "LawName", // type
                lawName,  // name
                lawNum,   // value
                scope,     // scope
                namePos,  // name_pos
            );

            lawnameSpan.el.replaceSpan(lawnameTextIndex, lawnameTextIndex + lawnameLength, declaration);
            lawnumSpan.el.replaceSpan(0, lawNum.length, lawnumEl);

            return declaration;
        }

    } else if (
        lawNum.length < lawnumSpan.text.length &&
        lawnumSpan.text[lawNum.length] === "。" &&
        lawnumSpan.index + 5 < spans.length
    ) {
        const [
            nameStartSpan,
            nameSpan,
            nameEndSpan,
            nameAfterSpan,
        ] = spans.slice(lawnumSpan.index + 1, lawnumSpan.index + 5);

        const scopeMatch = /^(以下)?(?:([^。]+?)において)?(?:単に)?$/.exec(lawnumSpan.text.slice(lawNum.length + 1));
        const nameAfterMatch = /^という。/.exec(nameAfterSpan.text);
        if (
            scopeMatch &&
            nameStartSpan.el.tag === "__PStart" &&
            nameStartSpan.el.attr.type === "square" &&
            nameEndSpan.el.tag === "__PEnd" &&
            nameEndSpan.el.attr.type === "square" &&
            nameAfterMatch
        ) {
            const following = scopeMatch[1] !== undefined;
            const scopeText = scopeMatch[2] || null;

            const scope = scopeText
                ? getScope(lawnumSpan, scopeText, following, nameAfterSpan.index)
                : [new ScopeRange(nameAfterSpan.index, 0, spans.length, 0)];

            const namePos = new Pos(
                nameSpan,       // span
                nameSpan.index, // span_index
                0,               // text_index
                nameSpan.text.length, // length
                nameSpan.env,   // env
            );

            const declaration = new ____Declaration(
                "LawName", // type
                nameSpan.text,  // name
                lawNum,   // value
                scope,     // scope
                namePos,  // name_pos
            );

            lawnameSpan.el.replaceSpan(lawnameTextIndex, lawnameTextIndex + lawnameLength, new EL("____DeclarationVal", {}, [lawName]));
            nameSpan.el.replaceSpan(0, nameSpan.text.length, declaration);
            lawnumSpan.el.replaceSpan(0, lawNum.length, lawnumEl);
            return declaration;
        }
    }
    return null;

};

const detectName = (spans: Span[], spanIndex: number) => {
    if (spans.length < spanIndex + 5) return null;
    const [
        nameBeforeSpan,
        nameStartSpan,
        nameSpan,
        nameEndSpan,
        nameAfterSpan,
    ] = spans.slice(spanIndex, spanIndex + 5);

    const scopeMatch = /(以下)?(?:([^。]+?)において)?(?:単に)?$/.exec(nameBeforeSpan.text);
    const nameAfterMatch = /^という。/.exec(nameAfterSpan.text);
    if (
        scopeMatch &&
        nameStartSpan.el.tag === "__PStart" &&
        nameStartSpan.el.attr.type === "square" &&
        nameEndSpan.el.tag === "__PEnd" &&
        nameEndSpan.el.attr.type === "square" &&
        nameAfterMatch
    ) {
        const following = scopeMatch[1] !== undefined;
        const scopeText = scopeMatch[2] || null;

        const scope = scopeText
            ? getScope(nameBeforeSpan, scopeText, following, nameAfterSpan.index)
            : [new ScopeRange(nameAfterSpan.index, 0, spans.length, 0)];

        const namePos = new Pos(
            nameSpan,       // span
            nameSpan.index, // span_index
            0,               // text_index
            nameSpan.text.length, // length
            nameSpan.env,   // env
        );

        const declaration = new ____Declaration(
            "LawName", // type
            nameSpan.text,  // name
            null,   // value
            scope,     // scope
            namePos,  // name_pos
        );

        nameSpan.el.replaceSpan(0, nameSpan.text.length, declaration);
        return declaration;
    }

    return null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const detectDeclarations = (_law: EL, spans: Span[], _containers: Container[]) => {

    const declarations = new Declarations();

    for (let spanIndex = 0; spanIndex < spans.length; spanIndex++) {
        const declaration =
            detectLawname(spans, spanIndex) ||
            detectName(spans, spanIndex);
        if (declaration) {
            declaration.attr.declaration_index = String(declarations.length);
            declarations.add(declaration);
        }
    }

    return declarations;
};

const detectVariableReferences = (_law: EL, spans: Span[], declarations: Declarations) => {

    let variableReferences: ____VarRef[] = [];

    const detect = (span: Span) => {
        const parent = span.env.parents[span.env.parents.length - 1];
        if (parent.tag === "__PContent" && parent.attr.type === "square") return;
        const ret: ____VarRef[] = [];
        for (const declaration of declarations.getInSpan(span.index)) {
            const textScope = {
                start: 0,
                end: Number.POSITIVE_INFINITY,
            };
            let nextIndexOffset = 0;
            for (const child of span.el.children) {
                const indexOffset = nextIndexOffset;
                nextIndexOffset += (child instanceof EL ? child.text : child).length;
                if (child instanceof EL) continue;

                let searchIndex = 0;
                while (true) {
                    const index = child.indexOf(declaration.name, searchIndex);
                    if (index < 0) break;

                    searchIndex = index + declaration.name.length;

                    if (textScope.start <= index && index < textScope.end) {
                        const refPos = new Pos(
                            span,       // span
                            span.index, // span_index
                            index + indexOffset,      // text_index
                            declaration.name.length, // length
                            span.env,   // env
                        );

                        const varref = new ____VarRef(declaration.name, declaration, refPos);
                        span.el.replaceSpan(index + indexOffset, searchIndex + indexOffset, varref);
                        ret.push(varref);
                    }

                }
            }
        }
        return ret;
    };

    for (const span of spans) {
        const varrefs = detect(span);
        if (varrefs) {
            variableReferences = variableReferences.concat(varrefs);
        }
    }

    return variableReferences;
};

export interface Analysis {
    declarations: Declarations,
    variableReferences: ____VarRef[],
}

export const analyze = (law: EL): Analysis => {
    const [spans, containers] = extractSpans(law);
    const declarations = detectDeclarations(law, spans, containers);
    const variableReferences = detectVariableReferences(law, spans, declarations);
    return {
        declarations,
        variableReferences,
    };
};

export const stdxmlToExt = (el: EL): EL => {
    if (["LawNum", "QuoteStruct"].indexOf(el.tag) < 0) {
        const isMixed = el.children.some(child => typeof child === "string" || child instanceof String);
        if (isMixed) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                el.children = parser.parse(el.innerXML().replace(/\r|\n/, ""), { startRule: "INLINE" });
            } catch (e) {
                console.log("stdxml_to_ext: Error", el.innerXML());
                throw e;
            }
        } else {
            el.children = (el.children as EL[]).map(stdxmlToExt);
        }
    }
    return el;
};
