
import type * as std from "../../law/std";
import type { Declarations } from "../common/declarations";
import { ____VarRef } from "../../node/el/controls/varRef";
import type { SentenceEnvsStruct } from "../getSentenceEnvs";
import type { ____Declaration, ____LawRef } from "../../node/el/controls";
import { __Parentheses, __Text, ____PointerRanges } from "../../node/el/controls";
import type { WithErrorValue } from "../../parser/std/util";
import type { SentenceChildEL } from "../../node/cst/inline";
import { ErrorMessage } from "../../parser/cst/error";
import type { SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";
import { isSentenceText } from "../../node/container/sentenceEnv";
import { isIgnoreAnalysis } from "../common";
import type { PointerEnvsStruct } from "../pointerEnvs/getPointerEnvs";

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

    {
        let ramainingText = textEL.text();
        for (const declaration of declarations.values()) {
            for (;;) {
                const nameOffset = ramainingText.indexOf(declaration.attr.name);
                if (nameOffset < 0) break;
                found.push([[nameOffset, nameOffset + declaration.attr.name.length], declaration]);
                ramainingText = ramainingText.slice(0, nameOffset) + "　".repeat(declaration.attr.name.length) + ramainingText.slice(nameOffset + declaration.attr.name.length);
            }
        }
    }

    if (found.length === 0) return null;

    found.sort(([a], [b]) => ((a[0] - b[0]) || (a[1] - b[1]) ));

    const text = textEL.text();
    const textRange = sentenceEnv.textRageOfEL(textEL);

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


export const detectVariableReferencesOfEL = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    declarations: Declarations,
    lawRefByDeclarationID: Map<string, ____LawRef>,
    pointerEnvsStruct: PointerEnvsStruct,
): WithErrorValue<{varRefs: ____VarRef[]}> => {

    const varRefs: ____VarRef[] = [];
    const errors: ErrorMessage[] = [];

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
            });

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

                    const lastNewItem = match.value.newItems[match.value.newItems.length - 1];
                    if (lastNewItem instanceof ____VarRef) {
                        const declaration = declarations.get(lastNewItem.attr.declarationID);
                        if (declaration.attr.type === "LawTitle") {
                            const pointerRangesIndex = childIndex + match.value.newItems.length;

                            if (
                                (pointerRangesIndex < elToBeModified.children.length)
                            && (elToBeModified.children[pointerRangesIndex] instanceof ____PointerRanges)
                            )
                            {
                                const pointerRanges = elToBeModified.children[pointerRangesIndex] as ____PointerRanges;
                                const firstPointer = pointerRanges.ranges()[0].pointers()[0];
                                const pointerEnv = pointerEnvsStruct.pointerEnvByEL.get(firstPointer);
                                const lawRef = lawRefByDeclarationID.get(declaration.attr.declarationID);
                                if (pointerEnv && declaration.attr.value && lawRef) {
                                    pointerEnv.prependedLawRef = lawRef;
                                }
                            }
                        }
                    }

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
            });

            const newResult = detectVariableReferencesOfEL(child as std.StdEL | std.__EL, sentenceEnv, filteredDeclarations, lawRefByDeclarationID, pointerEnvsStruct);
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
            }),
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
