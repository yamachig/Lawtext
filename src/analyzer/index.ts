"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sha512 from "hash.js/lib/hash/sha/512";
import { LAWNUM_TABLE, KEY_LENGTH } from "../law/lawNumTable";
import { throwError } from "../util";
import { Container, ContainerType } from "../node/container";
import { Env } from "../node/env";
import { Span } from "../node/span";
import { EL } from "../node/el";
import { RelPos, Pointer, Ranges } from "../node/pointer";
import { $ranges } from "./range";
import { initialEnv } from "../parser/cst/env";
import { $sentenceChildren } from "../parser/cst/rules/$sentenceChildren";
import * as std from "../law/std";
import { lawTypes } from "../law/num";
import { isJsonEL } from "../node/el/jsonEL";

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
            // console.warn(`unexpected mixed content! ${JSON.stringify(el)}`);
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

interface PosOptions {
    span: Span,
    spanIndex: number,
    textIndex: number,
    length: number,
    env: Env,
}

class Pos {
    public span: Span;
    public spanIndex: number;
    public textIndex: number;
    public length: number;
    public env: Env;
    constructor(options: PosOptions) {
        this.span = options.span;
        this.spanIndex = options.spanIndex;
        this.textIndex = options.textIndex;
        this.length = options.length;
        this.env = options.env;
    }
}

export interface DeclarationOptions {
    type: string,
    name: string,
    value: string | null,
    scope: ScopeRange[],
    namePos: Pos,
    range: [start: number, end: number] | null,
}

export class ____Declaration extends EL {
    public type: string;
    public name: string;
    public scope: ScopeRange[];
    public value: string | null;
    public namePos: Pos;
    constructor(options: DeclarationOptions) {
        super("____Declaration", {}, [], options.range);

        this.type = options.type;
        this.name = options.name;
        this.value = options.value;
        this.scope = options.scope;
        this.namePos = options.namePos;

        this.attr.type = this.type;
        this.attr.name = this.name;
        if (this.value !== null) this.attr.value = this.value;
        this.attr.scope = JSON.stringify(this.scope);
        this.attr.name_pos = JSON.stringify({
            span_index: this.namePos.spanIndex,
            text_index: this.namePos.textIndex,
            length: this.namePos.length,
        });

        this.append(this.name);
    }

    public get nameRange(): [number, number] | null {
        return this.namePos.span.el.range && [
            this.namePos.span.el.range[0] + this.namePos.textIndex,
            this.namePos.span.el.range[0] + this.namePos.textIndex + this.namePos.length,
        ];
    }
}

interface ScopeRangeOptions {
    startSpanIndex: number,
    startTextIndex: number,
    endSpanIndex: number, // half open
    endTextIndex: number, // half open
}

class ScopeRange {
    public startSpanIndex: number;
    public startTextIndex: number;
    public endSpanIndex: number;
    public endTextIndex: number;
    constructor(options: ScopeRangeOptions) {
        this.startSpanIndex = options.startSpanIndex;
        this.startTextIndex = options.startTextIndex;
        this.endSpanIndex = options.endSpanIndex;
        this.endTextIndex = options.endTextIndex;
    }
}

export interface VarRefOptions {
    refName: string,
    declaration: ____Declaration,
    refPos: Pos,
    range: [start: number, end: number] | null,
}

export class ____VarRef extends EL {
    public refName: string;
    public declaration: ____Declaration;
    public refPos: Pos;
    constructor(options: VarRefOptions) {
        super("____VarRef", {}, [], options.range);

        this.refName = options.refName;
        this.declaration = options.declaration;
        this.refPos = options.refPos;

        this.attr.ref_declaration_index = this.declaration.attr.declaration_index;

        this.append(this.refName);
    }
}

export class Declarations {
    public declarations: ____Declaration[];
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

const parseRanges = (text: string): Ranges => { // closed
    if (text === "") return [];
    const result = $ranges.match(0, text, initialEnv({}));
    if (result.ok) return result.value.value;
    else return [];
};

const locatePointer = (
    origPointer: Pointer,
    prevPointer: Pointer | null,
    currentSpan: Span,
): Pointer => {

    let locatedPointer: Pointer;

    const head = origPointer[0];
    const headType = getContainerType(head.tag);
    const currentContainer = currentSpan.env.container;

    if (ignoreSpanTag.indexOf(head.tag) >= 0) {
        locatedPointer = origPointer;

    } else if (head.relPos === RelPos.SAME) {
        // console.warn("RelPos.SAME is detected. Skipping:", currentSpan, origPointer);
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

const locateRanges = (origRanges: Ranges, currentSpan: Span) => {
    const ranges: Ranges = [];

    let prevPointer: Pointer | null = null;
    for (const [origFrom, origTo] of origRanges) {
        const from = locatePointer(origFrom, prevPointer, currentSpan);
        prevPointer = from;
        let to: Pointer | null;
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
                ret.push(new ScopeRange({
                    startSpanIndex: followingIndex,
                    startTextIndex: 0,
                    endSpanIndex: toc.spanRange[1],
                    endTextIndex: 0,
                }));
            } else {
                ret.push(new ScopeRange({
                    startSpanIndex: fromc.spanRange[0],
                    startTextIndex: 0,
                    endSpanIndex: toc.spanRange[1],
                    endTextIndex: 0,
                }));
            }
        } else {
            // console.warn("Scope couldn't be detected:", { from, to });
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

    const lawNumRange = lawnumSpan.el.range ? [
        lawnumSpan.el.range[0] + match.index,
        lawnumSpan.el.range[0] + match.index + lawNum.length,
    ] as [number, number] : null;

    const lawnumEl = new EL("____LawNum", {}, [lawNum], lawNumRange);

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
                new ScopeRange({
                    startSpanIndex: afterSpan.index + 1,
                    startTextIndex: 0,
                    endSpanIndex: spans.length, // half open
                    endTextIndex: 0, // half open
                }),
            ];

            const namePos = new Pos({
                span: lawnameSpan,
                spanIndex: lawnameSpan.index,
                textIndex: lawnameTextIndex,
                length: lawnameLength,
                env: lawnameSpan.env,
            });

            const range = lawnameSpan.el.range ? [
                lawnameSpan.el.range[0] + lawnameTextIndex,
                lawnameSpan.el.range[0] + lawnameTextIndex + lawnameLength,
            ] as [number, number] : null;

            const declaration = new ____Declaration({
                type: "LawName",
                name: lawName,
                value: lawNum,
                scope: scope,
                namePos: namePos,
                range,
            });

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
                : [
                    new ScopeRange({
                        startSpanIndex: nameAfterSpan.index,
                        startTextIndex: 0,
                        endSpanIndex: spans.length,
                        endTextIndex: 0,
                    }),
                ];

            const namePos = new Pos({
                span: nameSpan,
                spanIndex: nameSpan.index,
                textIndex: 0,
                length: nameSpan.text.length,
                env: nameSpan.env,
            });

            const range = lawnameSpan.el.range ? [
                lawnameSpan.el.range[0] + lawnameTextIndex,
                lawnameSpan.el.range[0] + lawnameTextIndex + lawnameLength,
            ] as [number, number] : null;

            const declaration = new ____Declaration({
                type: "LawName",
                name: nameSpan.text,
                value: lawNum,
                scope: scope,
                namePos: namePos,
                range,
            });

            lawnameSpan.el.replaceSpan(lawnameTextIndex, lawnameTextIndex + lawnameLength, new EL("____DeclarationVal", {}, [lawName]));
            nameSpan.el.replaceSpan(0, nameSpan.text.length, declaration);
            lawnumSpan.el.replaceSpan(0, lawNum.length, lawnumEl);
            return declaration;
        }
    }
    return null;

};

const detectNameInline = (spans: Span[], spanIndex: number) => {
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
            : [
                new ScopeRange({
                    startSpanIndex: nameAfterSpan.index,
                    startTextIndex: 0,
                    endSpanIndex: spans.length,
                    endTextIndex: 0,
                }),
            ];

        const namePos = new Pos({
            span: nameSpan,
            spanIndex: nameSpan.index,
            textIndex: 0,
            length: nameSpan.text.length,
            env: nameSpan.env,
        });

        const range = nameSpan.el.range ? [
            nameSpan.el.range[0],
            nameSpan.el.range[0] + nameSpan.text.length,
        ] as [number, number] : null;

        const declaration = new ____Declaration({
            type: "Keyword",
            name: nameSpan.text,
            value: null,
            scope: scope,
            namePos: namePos,
            range,
        });

        nameSpan.el.replaceSpan(0, nameSpan.text.length, declaration);
        return declaration;
    }

    return null;
};

const detectNameList = (spans: Span[], spanIndex: number): ____Declaration[] => {
    const ret: ____Declaration[] = [];

    let columnsMode = true;
    let paragraphMatch = /([^。\r\n]+?)において、?[次左]の各号に掲げる用語の意義は、(?:それぞれ)?当該各号に定めるところによる。$/.exec(spans[spanIndex].text);
    if (!paragraphMatch) {
        columnsMode = false;
        paragraphMatch = /^(.+?)(?:及びこの法律に基づく命令)?(?:において次に掲げる用語は、|の規定の解釈に(?:ついて|関して)は、)次の定義に従うものとする。$/.exec(spans[spanIndex].text);
        if (!paragraphMatch) return ret;
    }

    const paragraph = spans[spanIndex].env.container;
    for (const item of paragraph.parent?.children ?? []) {
        const sentence = item.el.children.find(el => isJsonEL(el) && (std.paragraphItemSentenceTags as unknown as string[]).includes(el.tag));
        if (!sentence || !isJsonEL(sentence)) continue;

        let nameSpan: Span|null = null;
        let name: string|null = null;
        let value: string|null = null;
        if (columnsMode) {
            if (sentence.children.length < 2) continue;

            const [nameCol, valCol] = sentence.children;
            if (!isJsonEL(nameCol) || !isJsonEL(valCol)) continue;

            name = nameCol.text;
            value = valCol.text;

            for (let i = item.spanRange[0]; i < item.spanRange[1]; i++) {
                if (spans[i].env.parents.includes(nameCol)) nameSpan = spans[i];
            }
        } else {
            let defStartSpanI: number | null = null;
            for (let i = item.spanRange[0]; i < item.spanRange[1]; i++) {
                if (spans[i].env.parents.includes(sentence)) {
                    defStartSpanI = i;
                    break;
                }
            }
            if (defStartSpanI === null) continue;
            const [
                nameStartSpan,
                _nameSpan,
                nameEndSpan,
                ...nameAfterSpans
            ] = spans.slice(defStartSpanI, item.spanRange[1]);
            const nameAfterSpansText = nameAfterSpans.map(s => s.text).join();
            const nameAfterMatch = /^とは、(.+)をいう。(?!）)/.exec(nameAfterSpansText);
            if (
                nameStartSpan.el.tag === "__PStart" &&
                nameStartSpan.el.attr.type === "square" &&
                nameEndSpan.el.tag === "__PEnd" &&
                nameEndSpan.el.attr.type === "square" &&
                nameAfterMatch
            ) {
                nameSpan = _nameSpan;
                name = nameSpan.text;
                value = nameAfterMatch[1];
            }
        }

        if (nameSpan === null || name === null || value === null) continue;

        const scopeText = paragraphMatch[1] || null;

        const scope = !scopeText
            ? [
                new ScopeRange({
                    startSpanIndex: spanIndex,
                    startTextIndex: 0,
                    endSpanIndex: spans.length,
                    endTextIndex: 0,
                }),
            ]
            : lawTypes.some(([ptn]) => {
                const re = new RegExp(`^この${ptn}`);
                return re.exec(scopeText);
            })
                ? [
                    new ScopeRange({
                        startSpanIndex: 0,
                        startTextIndex: 0,
                        endSpanIndex: spans.length,
                        endTextIndex: 0,
                    }),
                ]
                : getScope(
                    spans[spanIndex], // currentSpan
                    scopeText, // scopeText
                    false, // following
                    spanIndex, // followingIndex
                );

        const namePos = new Pos({
            span: nameSpan,       // span
            spanIndex: nameSpan.index, // span_index
            textIndex: 0,               // text_index
            length: nameSpan.text.length, // length
            env: nameSpan.env,   // env
        });

        const range = nameSpan.el.range ? [
            nameSpan.el.range[0],
            nameSpan.el.range[0] + nameSpan.text.length,
        ] as [number, number] : null;

        const declaration = new ____Declaration({
            type: "Keyword",
            name: name,
            value: value,
            scope: scope,
            namePos: namePos,
            range,
        });

        nameSpan.el.replaceSpan(0, nameSpan.text.length, declaration);

        ret.push(declaration);
    }
    return ret;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const detectDeclarations = (_law: EL, spans: Span[], _containers: Container[]) => {

    const declarations = new Declarations();

    for (let spanIndex = 0; spanIndex < spans.length; spanIndex++) {
        const declaration =
            detectLawname(spans, spanIndex) ||
            detectNameInline(spans, spanIndex);
        if (declaration) {
            declaration.attr.declaration_index = String(declarations.length);
            declarations.add(declaration);
        }

        for (const declaration of detectNameList(spans, spanIndex)) {
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
                        const refPos = new Pos({
                            span: span,       // span
                            spanIndex: span.index, // span_index
                            textIndex: index + indexOffset,      // text_index
                            length: declaration.name.length, // length
                            env: span.env,   // env
                        });

                        const range = span.el.range ? [
                            span.el.range[0] + index + indexOffset,
                            span.el.range[0] + searchIndex + indexOffset,
                        ] as [number, number] : null;

                        const varref = new ____VarRef({
                            refName: declaration.name,
                            declaration: declaration,
                            refPos: refPos,
                            range,
                        });
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

export const analyze = (lawToBeModified: EL): Analysis => {
    const [spans, containers] = extractSpans(lawToBeModified);
    const declarations = detectDeclarations(lawToBeModified, spans, containers);
    const variableReferences = detectVariableReferences(lawToBeModified, spans, declarations);
    return {
        declarations,
        variableReferences,
    };
};

export const stdxmlToExt = (elToBeModified: EL): EL => {
    if (["LawNum", "QuoteStruct"].indexOf(elToBeModified.tag) < 0) {
        const isMixed = elToBeModified.children.some(child => typeof child === "string" || child instanceof String);
        if (isMixed) {
            const result = $sentenceChildren.match(0, elToBeModified.innerXML().replace(/\r|\n/, ""), initialEnv({}));
            if (result.ok) {
                elToBeModified.children = result.value.value;
            } else {
                const message = `stdxml_to_ext: Error: ${elToBeModified.innerXML()}`;
                throw new Error(message);
            }
        } else {
            elToBeModified.children = (elToBeModified.children as EL[]).map(stdxmlToExt);
        }
    }
    return elToBeModified;
};
