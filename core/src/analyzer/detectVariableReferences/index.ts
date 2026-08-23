
import type * as std from "../../law/std/index.ts";
import type { Declarations } from "../common/declarations.ts";
import { ____VarRef } from "../../node/el/controls/varRef.ts";
import type { SentenceEnvsStruct } from "../getSentenceEnvs.ts";
import type { ____LawRef } from "../../node/el/controls/index.ts";
import type { ____Declaration } from "../../node/el/controls/index.ts";
import { ____PointerRanges, __Parentheses, __Text } from "../../node/el/controls/index.ts";
import type { WithErrorValue } from "../../parser/std/util.ts";
import type { SentenceChildEL } from "../../node/cst/inline.ts";
import { ErrorMessage } from "../../parser/cst/error.ts";
import type { SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv.ts";
import { isSentenceText, toSentenceTextRanges } from "../../node/container/sentenceEnv.ts";
import { isIgnoreAnalysis } from "../common/index.ts";
import type { PointerEnvsStruct } from "../pointerEnvs/getPointerEnvs.ts";
import getScope from "../pointerEnvs/getScope.ts";

const isWordLikeCharForShortNameBoundary = (char: string): boolean => (
    /^[\u3400-\u9fff\uf900-\ufaff々〆ヵヶァ-ヶｦ-ﾟA-Za-z0-9０-９Ａ-Ｚａ-ｚ]$/u.test(char)
);

const isShortNameBoundaryMatch = (
    text: string,
    offsetStart: number,
    offsetEnd: number,
    name: string,
): boolean => {
    if (name.length !== 1 || !isWordLikeCharForShortNameBoundary(name)) return true;

    const prevChar = text[offsetStart - 1] ?? "";
    if (prevChar && isWordLikeCharForShortNameBoundary(prevChar)) return false;

    const nextChar = text[offsetEnd] ?? "";
    if (nextChar && !["第", "別", "附"].includes(nextChar) && isWordLikeCharForShortNameBoundary(nextChar)) return false;

    return true;
};

export const matchVariableReferences = (
    textEL: __Text,
    sentenceEnv: SentenceEnv,
    declarations: Declarations,
): (
    | WithErrorValue<{
        newItems: SentenceChildEL[],
        varRefs: ____VarRef[],
    }>
    | null
) => {
    const errors: ErrorMessage[] = [];

    const found: [[offsetStart: number, offsetEnd: number], ____Declaration][] = [];

    const textRange = sentenceEnv.textRageOfEL(textEL) ?? [0, 0];

    {
        let ramainingText = textEL.text();
        for (const declaration of declarations.values()) {
            if (declaration.attr.name.length === 0) continue;
            for (;;) {
                const nameOffset = ramainingText.indexOf(declaration.attr.name);
                if (nameOffset < 0) break;

                if (!isShortNameBoundaryMatch(ramainingText, nameOffset, nameOffset + declaration.attr.name.length, declaration.attr.name)) {
                    ramainingText = ramainingText.slice(0, nameOffset) + "　".repeat(declaration.attr.name.length) + ramainingText.slice(nameOffset + declaration.attr.name.length);
                    continue;
                }

                const foundTextRange = {
                    start: textRange[0] + nameOffset,
                    end: textRange[0] + nameOffset + declaration.attr.name.length,
                };
                if (declaration.scope.some(scopeRange => (
                    (
                        (scopeRange.start.sentenceIndex < sentenceEnv.index)
                        || (
                            (scopeRange.start.sentenceIndex === sentenceEnv.index)
                            && (scopeRange.start.textOffset <= foundTextRange.start)
                        )
                    )
                    && (
                        (sentenceEnv.index < scopeRange.end.sentenceIndex)
                        || (
                            (sentenceEnv.index === scopeRange.end.sentenceIndex)
                            && (foundTextRange.end <= scopeRange.end.textOffset)
                        )
                    )
                ))) {
                    found.push([[nameOffset, nameOffset + declaration.attr.name.length], declaration]);
                    ramainingText = ramainingText.slice(0, nameOffset) + "　".repeat(declaration.attr.name.length) + ramainingText.slice(nameOffset + declaration.attr.name.length);
                }

            }
        }
    }

    if (found.length === 0) return null;

    found.sort(([a], [b]) => ((a[0] - b[0]) || (a[1] - b[1]) ));

    const text = textEL.text();

    const newItems: SentenceChildEL[] = [];
    const varRefs: ____VarRef[] = [];
    let lastOffset = 0;

    for (const [offsetRange, declaration] of found) {
        const name = declaration.attr.name;

        if (lastOffset < offsetRange[0]) {
            newItems.push(new __Text(
                text.substring(lastOffset, offsetRange[0]),
                textEL.range && [textEL.range[0] + lastOffset, textEL.range[0] + offsetRange[0]],
            ));
        }

        const refSentenceTextRange: SentenceTextRange = {
            start: {
                sentenceIndex: sentenceEnv.index,
                textOffset: (textRange?.[0] ?? Number.NaN) + offsetRange[0],
            },
            end: {
                sentenceIndex: sentenceEnv.index,
                textOffset: (textRange?.[0] ?? Number.NaN) + offsetRange[1],
            },
        };

        const range = (textEL.range) ? [
            textEL.range[0] + offsetRange[0],
            textEL.range[0] + offsetRange[1],
        ] as [number, number] : null;

        const varRef = new ____VarRef({
            refName: name,
            declarationID: declaration.attr.declarationID,
            refSentenceTextRange,
            range,
        });
        newItems.push(varRef);
        varRefs.push(varRef);

        lastOffset = offsetRange[1];

    }

    if (lastOffset < text.length) {
        newItems.push(new __Text(
            text.substring(lastOffset),
            textEL.range && [
                textEL.range[0] + lastOffset,
                textEL.range[1],
            ],
        ));
    }

    return {
        value: {
            newItems,
            varRefs,
        },
        errors,
    };

};


const posLt = (
    a: { sentenceIndex: number, textOffset: number },
    b: { sentenceIndex: number, textOffset: number },
): boolean => (
    (a.sentenceIndex < b.sentenceIndex)
    || (
        (a.sentenceIndex === b.sentenceIndex)
        && (a.textOffset < b.textOffset)
    )
);

const sentenceTextRangeContains = (
    outer: SentenceTextRange,
    inner: SentenceTextRange,
): boolean => !posLt(inner.start, outer.start) && !posLt(outer.end, inner.end);

const declarationScopeContains = (
    declaration: ____Declaration,
    sentenceTextRange: SentenceTextRange,
): boolean => declaration.scope.some(scopeRange => sentenceTextRangeContains(scopeRange, sentenceTextRange));

const sourceRange = (
    el: SentenceChildEL,
    offsetStart: number,
    offsetEnd: number,
): [start: number, end: number] | null => (
    el.range
        ? [el.range[0] + offsetStart, el.range[0] + offsetEnd]
        : null
);

const createVarRef = (
    declaration: ____Declaration,
    sentenceEnv: SentenceEnv,
    textOffsetStart: number,
    textOffsetEnd: number,
    range: [start: number, end: number] | null,
): ____VarRef => new ____VarRef({
    refName: declaration.attr.name,
    declarationID: declaration.attr.declarationID,
    refSentenceTextRange: {
        start: {
            sentenceIndex: sentenceEnv.index,
            textOffset: textOffsetStart,
        },
        end: {
            sentenceIndex: sentenceEnv.index,
            textOffset: textOffsetEnd,
        },
    },
    range,
});

const replaceTextELRangeWithVarRef = (
    elToBeModified: std.StdEL | std.__EL,
    childIndex: number,
    textEL: __Text,
    sentenceEnv: SentenceEnv,
    declaration: ____Declaration,
    offsetStart: number,
    offsetEnd: number,
): ____VarRef | null => {
    const textRange = sentenceEnv.textRageOfEL(textEL);
    if (!textRange) return null;

    const text = textEL.text();
    const newItems: SentenceChildEL[] = [];

    if (0 < offsetStart) {
        newItems.push(new __Text(
            text.substring(0, offsetStart),
            textEL.range && [textEL.range[0], textEL.range[0] + offsetStart],
        ));
    }

    const varRef = createVarRef(
        declaration,
        sentenceEnv,
        textRange[0] + offsetStart,
        textRange[0] + offsetEnd,
        sourceRange(textEL, offsetStart, offsetEnd),
    );
    newItems.push(varRef);

    if (offsetEnd < text.length) {
        newItems.push(new __Text(
            text.substring(offsetEnd),
            textEL.range && [textEL.range[0] + offsetEnd, textEL.range[1]],
        ));
    }

    elToBeModified.children.splice(
        childIndex,
        1,
        ...newItems,
    );

    return varRef;
};

const declarationsInPointerRanges = (
    pointerRanges: ____PointerRanges,
    sentenceEnvsStruct: SentenceEnvsStruct,
    declarations: Declarations,
    lawRefByDeclarationID: Map<string, ____LawRef>,
    pointerEnvsStruct: PointerEnvsStruct,
): ____Declaration[] => {
    const { ranges } = getScope({
        pointerRangesToBeModified: pointerRanges,
        pointerEnvsStruct,
        locateOptions: {
            declarations: declarations.db,
            lawRefByDeclarationID,
        },
    });

    const sentenceTextRanges = toSentenceTextRanges(ranges, sentenceEnvsStruct);
    if (sentenceTextRanges.length === 0) return [];

    return declarations.values().filter(declaration => (
        sentenceTextRanges.some(range => sentenceTextRangeContains(range, declaration.nameSentenceTextRange))
    ));
};

const matchExplicitPointerDefinedVariableReference = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
    declarations: Declarations,
    lawRefByDeclarationID: Map<string, ____LawRef>,
    pointerEnvsStruct: PointerEnvsStruct,
): ____VarRef | null => {
    const prefix = "に規定する";

    for (let childIndex = 0; childIndex < elToBeModified.children.length - 1; childIndex++) {
        const pointerRanges = elToBeModified.children[childIndex];
        const textEL = elToBeModified.children[childIndex + 1];
        if (!(pointerRanges instanceof ____PointerRanges)) continue;
        if (!(textEL instanceof __Text)) continue;

        const text = textEL.text();
        if (!text.startsWith(prefix)) continue;

        const declaration = declarationsInPointerRanges(
            pointerRanges,
            sentenceEnvsStruct,
            declarations,
            lawRefByDeclarationID,
            pointerEnvsStruct,
        ).find(declaration => (
            declaration.attr.name.length > 0
            && text.startsWith(declaration.attr.name, prefix.length)
        ));

        if (!declaration) continue;

        return replaceTextELRangeWithVarRef(
            elToBeModified,
            childIndex + 1,
            textEL,
            sentenceEnv,
            declaration,
            prefix.length,
            prefix.length + declaration.attr.name.length,
        );
    }

    return null;
};

interface DirectTextSegment {
    child: SentenceChildEL,
    childIndex: number,
    text: string,
    textStart: number,
    textEnd: number,
}

interface CrossChildMatch {
    declaration: ____Declaration,
    segments: DirectTextSegment[],
    start: number,
    end: number,
}

const isCrossChildReferenceSegment = (child: unknown): child is SentenceChildEL => (
    child instanceof __Text
    || child instanceof ____PointerRanges
);

const findSegmentIndexAtOffset = (
    segments: DirectTextSegment[],
    textOffset: number,
): number => segments.findIndex(segment => segment.textStart <= textOffset && textOffset < segment.textEnd);

const findFirstCrossChildVariableReference = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    declarations: Declarations,
): CrossChildMatch | null => {
    let bestMatch: CrossChildMatch | null = null;

    const groups: DirectTextSegment[][] = [];
    let currentGroup: DirectTextSegment[] = [];

    const flushCurrentGroup = () => {
        if (currentGroup.length > 1) groups.push(currentGroup);
        currentGroup = [];
    };

    for (let childIndex = 0; childIndex < elToBeModified.children.length; childIndex++) {
        const child = elToBeModified.children[childIndex];
        if (isCrossChildReferenceSegment(child)) {
            const textRange = sentenceEnv.textRageOfEL(child);
            if (
                textRange
                && (
                    currentGroup.length === 0
                    || currentGroup[currentGroup.length - 1].textEnd === textRange[0]
                )
            ) {
                currentGroup.push({
                    child,
                    childIndex,
                    text: child.text(),
                    textStart: textRange[0],
                    textEnd: textRange[1],
                });
                continue;
            }
        }
        flushCurrentGroup();
    }
    flushCurrentGroup();

    for (const segments of groups) {
        const textStart = segments[0].textStart;
        const text = segments.map(segment => segment.text).join("");

        for (const declaration of declarations.values()) {
            const name = declaration.attr.name;
            if (name.length === 0) continue;

            let offset = text.indexOf(name);
            while (0 <= offset) {
                const start = textStart + offset;
                const end = start + name.length;
                const startSegmentIndex = findSegmentIndexAtOffset(segments, start);
                const endSegmentIndex = findSegmentIndexAtOffset(segments, end - 1);
                const crossesChildren = (
                    startSegmentIndex >= 0
                    && endSegmentIndex >= 0
                    && startSegmentIndex !== endSegmentIndex
                );
                const includesPointerRanges = (
                    crossesChildren
                    && segments
                        .slice(startSegmentIndex, endSegmentIndex + 1)
                        .some(segment => segment.child instanceof ____PointerRanges)
                );
                const refSentenceTextRange: SentenceTextRange = {
                    start: {
                        sentenceIndex: sentenceEnv.index,
                        textOffset: start,
                    },
                    end: {
                        sentenceIndex: sentenceEnv.index,
                        textOffset: end,
                    },
                };

                if (
                    includesPointerRanges
                    && declarationScopeContains(declaration, refSentenceTextRange)
                    && (
                        !bestMatch
                        || start < bestMatch.start
                        || (
                            start === bestMatch.start
                            && bestMatch.end - bestMatch.start < end - start
                        )
                    )
                ) {
                    bestMatch = {
                        declaration,
                        segments,
                        start,
                        end,
                    };
                }

                offset = text.indexOf(name, offset + name.length);
            }
        }
    }

    return bestMatch;
};

const replaceCrossChildVariableReference = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    match: CrossChildMatch,
): ____VarRef | null => {
    const startSegmentIndex = findSegmentIndexAtOffset(match.segments, match.start);
    const endSegmentIndex = findSegmentIndexAtOffset(match.segments, match.end - 1);
    if (startSegmentIndex < 0 || endSegmentIndex < 0) return null;

    const firstSegment = match.segments[startSegmentIndex];
    const lastSegment = match.segments[endSegmentIndex];
    const firstOffsetStart = match.start - firstSegment.textStart;
    const lastOffsetEnd = match.end - lastSegment.textStart;

    if (0 < firstOffsetStart && !(firstSegment.child instanceof __Text)) return null;
    if (lastOffsetEnd < lastSegment.text.length && !(lastSegment.child instanceof __Text)) return null;

    const newItems: SentenceChildEL[] = [];

    if (0 < firstOffsetStart) {
        newItems.push(new __Text(
            firstSegment.text.substring(0, firstOffsetStart),
            firstSegment.child.range && [firstSegment.child.range[0], firstSegment.child.range[0] + firstOffsetStart],
        ));
    }

    const sourceRangeStart = firstSegment.child.range
        ? firstSegment.child.range[0] + firstOffsetStart
        : null;
    const sourceRangeEnd = lastSegment.child.range
        ? lastSegment.child.range[0] + lastOffsetEnd
        : null;

    const varRef = createVarRef(
        match.declaration,
        sentenceEnv,
        match.start,
        match.end,
        (sourceRangeStart !== null && sourceRangeEnd !== null)
            ? [sourceRangeStart, sourceRangeEnd]
            : null,
    );
    newItems.push(varRef);

    if (lastOffsetEnd < lastSegment.text.length) {
        newItems.push(new __Text(
            lastSegment.text.substring(lastOffsetEnd),
            lastSegment.child.range && [lastSegment.child.range[0] + lastOffsetEnd, lastSegment.child.range[1]],
        ));
    }

    elToBeModified.children.splice(
        firstSegment.childIndex,
        lastSegment.childIndex - firstSegment.childIndex + 1,
        ...newItems,
    );

    return varRef;
};


export const detectVariableReferencesOfEL = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    declarations: Declarations,
    allDeclarations: Declarations,
    sentenceEnvsStruct: SentenceEnvsStruct,
    lawRefByDeclarationID: Map<string, ____LawRef>,
    pointerEnvsStruct: PointerEnvsStruct,
): WithErrorValue<{varRefs: ____VarRef[]}> => {

    const varRefs: ____VarRef[] = [];
    const errors: ErrorMessage[] = [];

    for (;;) {
        const varRef = matchExplicitPointerDefinedVariableReference(
            elToBeModified,
            sentenceEnv,
            sentenceEnvsStruct,
            allDeclarations,
            lawRefByDeclarationID,
            pointerEnvsStruct,
        );
        if (!varRef) break;
        varRefs.push(varRef);
    }

    for (;;) {
        const match = findFirstCrossChildVariableReference(
            elToBeModified,
            sentenceEnv,
            declarations,
        );
        if (!match) break;

        const varRef = replaceCrossChildVariableReference(
            elToBeModified,
            sentenceEnv,
            match,
        );
        if (!varRef) break;
        varRefs.push(varRef);
    }

    for (let childIndex = 0; childIndex < elToBeModified.children.length; childIndex++) {

        const child = elToBeModified.children[childIndex];

        if (isIgnoreAnalysis(child)) {
            continue;

        } else if (typeof child === "string") {
            continue;

        } else if (child instanceof __Parentheses && child.attr.type === "square") {
            continue;

        } else if (child instanceof __Text) {
            const textRange = sentenceEnv.textRageOfEL(child);
            if (!textRange) {
                errors.push(new ErrorMessage(
                    "textRange is null",
                    [
                        child?.range?.[0] ?? 0,
                        child?.range?.[1] ?? 0,
                    ],
                ));
                continue;
            }
            const filteredDeclarations = declarations.filterByRange({
                start: {
                    sentenceIndex: sentenceEnv.index,
                    textOffset: textRange[0],
                },
                end: {
                    sentenceIndex: sentenceEnv.index,
                    textOffset: textRange[1],
                },
            }, true);

            {
                const match = matchVariableReferences(child, sentenceEnv, filteredDeclarations);
                if (match) {
                    varRefs.push(...match.value.varRefs);
                    errors.push(...match.errors);

                    elToBeModified.children.splice(
                        childIndex,
                        1,
                        ...match.value.newItems,
                    );

                    childIndex += match.value.newItems.length - 1;
                    continue;
                }
            }

        } else if (isSentenceText(child)) {
            continue;

        } else {
            const textRange = sentenceEnv.textRageOfEL(child);
            if (!textRange) {
                errors.push(new ErrorMessage(
                    "textRange is null",
                    [
                        child?.range?.[0] ?? 0,
                        child?.range?.[1] ?? 0,
                    ],
                ));
                continue;
            }
            const filteredDeclarations = declarations.filterByRange({
                start: {
                    sentenceIndex: sentenceEnv.index,
                    textOffset: textRange[0],
                },
                end: {
                    sentenceIndex: sentenceEnv.index,
                    textOffset: textRange[1],
                },
            }, true);

            const newResult = detectVariableReferencesOfEL(
                child as std.StdEL | std.__EL,
                sentenceEnv,
                filteredDeclarations,
                allDeclarations,
                sentenceEnvsStruct,
                lawRefByDeclarationID,
                pointerEnvsStruct,
            );
            varRefs.push(...newResult.value.varRefs);
            errors.push(...newResult.errors);
        }
    }

    return {
        value: {
            varRefs,
        },
        errors,
    };
};


export const detectVariableReferences = (
    sentenceEnvsStruct: SentenceEnvsStruct,
    declarations: Declarations,
    lawRefByDeclarationID: Map<string, ____LawRef>,
    pointerEnvsStruct: PointerEnvsStruct,
): WithErrorValue<{varRefs: ____VarRef[]}> => {

    const varRefs: ____VarRef[] = [];
    const errors: ErrorMessage[] = [];

    for (const sentenceEnv of sentenceEnvsStruct.sentenceEnvs) {
        const result = detectVariableReferencesOfEL(
            sentenceEnv.el,
            sentenceEnv,
            declarations.filterByRange({
                start: {
                    sentenceIndex: sentenceEnv.index,
                    textOffset: 0,
                },
                end: {
                    sentenceIndex: sentenceEnv.index + 1,
                    textOffset: 0,
                },
            }, true),
            declarations,
            sentenceEnvsStruct,
            lawRefByDeclarationID,
            pointerEnvsStruct,
        );

        if (result){
            for (const varRef of result.value.varRefs) {
                const lawRef = lawRefByDeclarationID.get(varRef.attr.declarationID);
                if (lawRef) {
                    sentenceEnv.addPointerLike({
                        textRange: sentenceEnv.textRageOfEL(varRef),
                        pointerLike: [varRef, lawRef],
                    });
                }
            }

            varRefs.push(...result.value.varRefs);
            errors.push(...result.errors);
        }
    }


    return { value: { varRefs }, errors };
};

export default detectVariableReferences;
