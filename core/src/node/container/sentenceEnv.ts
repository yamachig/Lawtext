import type { Container } from ".";
import { ContainerType } from ".";
import { isIgnoreAnalysis } from "../../analyzer/common";
import type { SentenceEnvsStruct } from "../../analyzer/getSentenceEnvs";
import * as std from "../../law/std";
import { mergeAdjacentTextsWithString } from "../../parser/cst/util";
import type { EL } from "../el";
import type { RangeInfo, __MismatchEndParenthesis, __MismatchStartParenthesis, __PEnd, __PStart, ____Declaration, ____LawNum, ____LawRef, ____Pointer, ____VarRef } from "../el/controls";
import { __Text } from "../el/controls";
import type { PointerEnv } from "../pointerEnv";

export interface SentenceTextPos {
    sentenceIndex: number,
    textOffset: number,
}

export interface SentenceTextRange {
    start: SentenceTextPos,
    end: SentenceTextPos, // half open
}

const pushRange = (ranges: SentenceTextRange[], ...rangesToAdd: SentenceTextRange[]) => {
    for (const range of rangesToAdd) {
        if (ranges.length === 0) {
            ranges.push(range);
        } else {
            const lastRange = ranges[ranges.length - 1];
            if (lastRange.end.sentenceIndex === range.start.sentenceIndex && lastRange.end.textOffset === range.start.textOffset) {
                lastRange.end = range.end;
            } else {
                ranges.push(range);
            }
        }
    }
};

const fromToContainersToTextRanges = (from: string, to: string | null, sentenceEnvsStruct: SentenceEnvsStruct): SentenceTextRange[] => {
    const ranges: SentenceTextRange[] = [];
    if (to) {
        const fromContainer = sentenceEnvsStruct.containers.get(from);
        const toContainer = sentenceEnvsStruct.containers.get(to);
        if (fromContainer && toContainer) {
            pushRange(ranges, {
                start: {
                    sentenceIndex: fromContainer.sentenceRange[0],
                    textOffset: 0,
                },
                end: {
                    sentenceIndex: toContainer.sentenceRange[1],
                    textOffset: 0,
                },
            });
        }
    } else {
        const container = sentenceEnvsStruct.containers.get(from);
        if (container) {
            if (container.type === ContainerType.ROOT) {
                // "この法律" does not contain SupplProvision of other amendments.
                for (const rootChild of container.children) {
                    if (std.isSupplProvision(rootChild.el) && rootChild.el.attr.AmendLawNum) {
                        continue;
                    }
                    pushRange(ranges, {
                        start: {
                            sentenceIndex: rootChild.sentenceRange[0],
                            textOffset: 0,
                        },
                        end: {
                            sentenceIndex: rootChild.sentenceRange[1],
                            textOffset: 0,
                        },
                    });
                }

            } else {
                pushRange(ranges, {
                    start: {
                        sentenceIndex: container.sentenceRange[0],
                        textOffset: 0,
                    },
                    end: {
                        sentenceIndex: container.sentenceRange[1],
                        textOffset: 0,
                    },
                });
            }
        }
    }
    return ranges;
};

const excludeTextRanges = (origRanges: SentenceTextRange[], excludeRanges: SentenceTextRange[]) => {
    if (origRanges.length === 0 || excludeRanges.length === 0) return origRanges;

    const ranges: SentenceTextRange[] = [...origRanges.map(r => ({ ...{ start: { ...r.start }, end: { ...r.end } } }))];

    for (const excludeRange of excludeRanges) {
        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];

            if (
                (range.end.sentenceIndex < excludeRange.start.sentenceIndex)
                    || (
                        (range.end.sentenceIndex === excludeRange.start.sentenceIndex)
                        && (range.end.textOffset < excludeRange.start.textOffset)
                    )
                    || (excludeRange.end.sentenceIndex < range.start.sentenceIndex)
                    || (
                        (excludeRange.end.sentenceIndex === range.start.sentenceIndex)
                        && (excludeRange.end.textOffset < range.start.textOffset)
                    )
            ) {
                // No overlapping
                continue;

            } else if (
                (range.start.sentenceIndex < excludeRange.end.sentenceIndex)
                    || (
                        (range.start.sentenceIndex === excludeRange.end.sentenceIndex)
                        && (range.start.textOffset <= excludeRange.end.textOffset)
                    )
            ) {
                if (
                    (range.end.sentenceIndex < excludeRange.end.sentenceIndex)
                        || (
                            (range.end.sentenceIndex === excludeRange.end.sentenceIndex)
                            && (range.end.textOffset <= excludeRange.end.textOffset)
                        )
                ) {
                    // End of range will be excluded
                    range.end = { ...excludeRange.start };

                } else {
                    // Middle of range will be excluded
                    ranges.splice(i + 1, 0, {
                        start: { ...excludeRange.end },
                        end: { ...range.end },
                    });
                    range.end = { ...excludeRange.start };
                    i++;
                }
            } else {
                if (
                    (range.end.sentenceIndex < excludeRange.end.sentenceIndex)
                        || (
                            (range.end.sentenceIndex === excludeRange.end.sentenceIndex)
                            && (range.end.textOffset <= excludeRange.end.textOffset)
                        )
                ) {
                    // Whole range will be excluded
                    ranges.splice(i, 1);
                    i--;

                } else {
                    // Start of range will be excluded
                    range.start = { ...excludeRange.end };

                }

            }
        }
    }
    return ranges;
};

export const toSentenceTextRanges = (
    origRangeInfos: readonly RangeInfo[] | null,
    sentenceEnvsStruct: SentenceEnvsStruct,
    following?: SentenceTextPos | null,
) => {
    if (origRangeInfos) {
        const rangesBeforeFollowing: SentenceTextRange[] = [];
        for (const rangeInfo of origRangeInfos) {
            const { from, to } = rangeInfo;
            const origRanges = fromToContainersToTextRanges(from, to ?? null, sentenceEnvsStruct);
            const excludeRanges = rangeInfo.exclude && toSentenceTextRanges(rangeInfo.exclude, sentenceEnvsStruct);
            if (excludeRanges) {
                pushRange(rangesBeforeFollowing, ...excludeTextRanges(origRanges, excludeRanges));
            } else {
                pushRange(rangesBeforeFollowing, ...origRanges);
            }
        }

        if (following) {

            const ranges: SentenceTextRange[] = [];
            for (const origRange of rangesBeforeFollowing) {
                if (origRange.end.sentenceIndex === following.sentenceIndex) {
                    if (origRange.end.textOffset < following.textOffset) {
                        continue;
                    }
                } else if (origRange.end.sentenceIndex < following.sentenceIndex) {
                    continue;
                }

                const range = { start: { ...origRange.start }, end: { ...origRange.end } };
                if (range.start.sentenceIndex === following.sentenceIndex) {
                    if (range.start.textOffset < following.textOffset) {
                        Object.assign(range.start, following);
                    }
                } else if (range.start.sentenceIndex < following.sentenceIndex) {
                    Object.assign(range.start, following);
                }
                pushRange(ranges, range);
            }
            return ranges;
        } else {
            return rangesBeforeFollowing;
        }

    } else {
        if (!following) return [];
        // const sentenceEnv = sentenceEnvsStruct.sentenceEnvs[following.sentenceIndex];

        const start = { ...following };

        // const topLevelContainer = sentenceEnv.container.thisOrClosest(p => p.type === ContainerType.TOPLEVEL) ?? sentenceEnvsStruct.rootContainer;

        const ranges: SentenceTextRange[] = [];

        pushRange(
            ranges,
            {
                start,
                end: {
                    sentenceIndex: sentenceEnvsStruct.rootContainer.sentenceRange[1],
                    textOffset: 0,
                },
            },
        );

        // if (std.isMainProvision(topLevelContainer.el)) {
        //     const originalSupplProvisions = topLevelContainer.parent?.children.filter(c => (std.isSupplProvision(c.el) && (!c.el.attr.AmendLawNum))) ?? [];
        //     pushRange(
        //         ranges,
        //         {
        //             start,
        //             end: {
        //                 sentenceIndex: topLevelContainer.sentenceRange[1],
        //                 textOffset: 0,
        //             },
        //         },
        //         ...originalSupplProvisions.map(c => ({
        //             start: {
        //                 sentenceIndex: c.sentenceRange[0],
        //                 textOffset: 0,
        //             },
        //             end: {
        //                 sentenceIndex: c.sentenceRange[1],
        //                 textOffset: 0,
        //             },
        //         })),
        //     );

        // } else {
        //     pushRange(
        //         ranges,
        //         {
        //             start,
        //             end: {
        //                 sentenceIndex: topLevelContainer.sentenceRange[1],
        //                 textOffset: 0,
        //             },
        //         },
        //     );
        // }

        return ranges;
    }
};

export const sentenceTextTags = [
    "Ruby",
    "QuoteStruct",
    "ArithFormula",
    "Sub",
    "Sup",
    "Line",
    "__Text",
    "__PStart",
    "__PEnd",
    "__MismatchStartParenthesis",
    "__MismatchEndParenthesis",
    "____Pointer",
    "____LawNum",
    "____Declaration",
    "____VarRef",
] as const;

export type SentenceText = (
    | std.Ruby
    | std.QuoteStruct
    | std.ArithFormula
    | std.Sub
    | std.Sup
    | std.Line
    | __Text
    | __PStart
    | __PEnd
    | __MismatchStartParenthesis
    | __MismatchEndParenthesis
    | ____Pointer
    | ____LawNum
    | ____Declaration
    | ____VarRef
);

export const isSentenceText = (el: EL | string): el is SentenceText =>
    typeof el !== "string" && (sentenceTextTags as readonly string[]).includes(el.tag);

export const textOfSentenceText = (el: SentenceText): string => {
    if (el.tag === "Ruby") {
        return el.children.map(c => {
            if (typeof c === "string") {
                return c;
            } else if (c instanceof __Text) {
                return c.text();
            } else {
                return "";
            }
        }).join("");
    } else {
        return el.text();
    }
};

export function *enumerateSentenceTexts(el: EL): Iterable<SentenceText> {
    if (isSentenceText(el)) {
        yield el;
    } else if (!isIgnoreAnalysis(el)) {
        for (const child of el.children) {
            if (typeof child === "string") continue;
            yield *enumerateSentenceTexts(child);
        }
    }
}

export const setTextControl = (el: EL) => {
    if (isSentenceLike(el) && el.children.some(c => typeof c === "string")) {
        const first = el.children[0];
        if (typeof first === "string") {
            el.children[0] = new __Text(first, el.range && [el.range[0], el.range[0] + first.length]);
        }
        el.children.splice(0, el.children.length, ...mergeAdjacentTextsWithString(el.children));
    }
    for (const child of el.children) {
        if (typeof child === "string" || isSentenceText(child)) continue;
        setTextControl(child);
    }
};

export type SentenceLike = (
    | std.Sentence
    | std.EnactStatement
    | std.TableHeaderColumn
);

export const sentenceLikeTags = ["Sentence", "EnactStatement", "TableHeaderColumn"] as const;

export const isSentenceLike = (el: EL | string): el is SentenceLike =>
    typeof el !== "string" && (sentenceLikeTags as readonly string[]).includes(el.tag);

export interface SentenceEnvOptions {
    index: number,
    elToBeModified: SentenceLike,
    lawType: string,
    parentELs: EL[],
    container: Container,
}

export type PointerLike = PointerEnv | ____LawRef | [____VarRef, ____LawRef];

export class SentenceEnv {
    public readonly index: number;
    public readonly el: SentenceLike;
    public lawType: string;
    public parentELs: EL[];
    public container: Container;

    private _text: string;
    public get text(): string { return this._text; }

    private _pointerLikes: {
        textRange: [number, number] | null,
        pointerLike: PointerLike,
    }[] = [];
    public get pointerLikes(): Readonly<SentenceEnv["_pointerLikes"]> {
        return this._pointerLikes;
    }

    public addPointerLike(pointerLike: {
        textRange: [number, number] | null,
        pointerLike: PointerLike,
    }) {
        if (pointerLike.textRange) {
            for (let i = this._pointerLikes.length - 1; 0 <= i; i--) {
                const iRange = this._pointerLikes[i].textRange;
                if (iRange && iRange[0] < pointerLike.textRange[0]) {
                    this._pointerLikes.splice(i + 1, 0, pointerLike);
                    return;
                }
            }
            this._pointerLikes.unshift(pointerLike);
        } else {
            this._pointerLikes.push(pointerLike);
        }
    }

    constructor(options: SentenceEnvOptions) {
        const { index, elToBeModified: el, lawType, parentELs, container } = options;

        this.index = index;
        this.el = el;
        this.lawType = lawType;
        this.parentELs = parentELs;
        this.container = container;

        setTextControl(el);

        this._text = [...enumerateSentenceTexts(el)].map(textOfSentenceText).join("");

        const setParentOfChildELs = (el: EL) => {
            for (const c of el.children) {
                if (typeof c === "string") continue;
                setParentOfChildELs(c);
            }
        };
        setParentOfChildELs(this.el);
    }

    public linealAscendantOfEL(el: EL): EL[] | null {
        const f = (current: EL, el: EL): EL[] | null => {
            if (current === el) return [current];
            for (const child of current.children) {
                if (typeof child === "string") continue;
                const result = f(child, el);
                if (result) return [current, ...result];
            }
            return null;
        };
        return f(this.el, el);
    }

    public textRageOfEL(el: EL): [number, number] | null {
        if (isSentenceText(el)) {
            let offset = 0;
            for (const sentenceText of enumerateSentenceTexts(this.el)) {
                const length = textOfSentenceText(sentenceText).length;
                if (sentenceText === el) {
                    return [offset, offset + length];
                }
                offset += length;
            }
            return null;
        } else {
            const targetSentenceTexts = [...enumerateSentenceTexts(el)];
            const firstTarget = targetSentenceTexts[0];
            const lastTarget = targetSentenceTexts[targetSentenceTexts.length - 1];
            let offset = 0;
            let start: number | null = null;
            for (const sentenceText of enumerateSentenceTexts(this.el)) {
                const length = textOfSentenceText(sentenceText).length;
                if (sentenceText === firstTarget) {
                    start = offset;
                }
                if (sentenceText === lastTarget) {
                    return ((start !== null) && [start, offset + length]) || null;
                }
                offset += length;
            }
            return null;
        }
    }

    public sentenceTextAt(targetOffset: number): SentenceText | null {
        let offset = 0;
        for (const sentenceText of enumerateSentenceTexts(this.el)) {
            const length = textOfSentenceText(sentenceText).length;
            if (offset <= targetOffset && targetOffset < offset + length) {
                return sentenceText;
            }
            offset += length;
        }
        return null;
    }
}
