
import * as std from "../../law/std";
import { Declarations } from "../common/declarations";
import { ____VarRef } from "../../node/el/controls/varRef";
import { SentenceEnvsStruct } from "../getSentenceEnvs";
import { __Parentheses, __Text, ____Declaration } from "../../node/el/controls";
import { WithErrorValue } from "../../parser/std/util";
import { SentenceChildEL } from "../../node/cst/inline";
import { ErrorMessage } from "../../parser/cst/error";
import { isSentenceText, SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";
import { isIgnoreAnalysis } from "../common";

export const matchVariableReferences = (textEL: __Text, sentenceEnv: SentenceEnv, declarations: Declarations): (
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


export const detectVariableReferencesOfEL = (elToBeModified: std.StdEL | std.__EL, sentenceEnv: SentenceEnv, declarations: Declarations): WithErrorValue<{varRefs: ____VarRef[]}> => {

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
            if (!textRange) throw new Error("textRange is null");
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

                    childIndex += match.value.newItems.length - 1;
                    continue;
                }
            }

        } else if (isSentenceText(child)) {
            continue;

        } else {
            const textRange = sentenceEnv.textRageOfEL(child);
            if (!textRange) {
                throw new Error("textRange is null");
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

            const newResult = detectVariableReferencesOfEL(child as std.StdEL | std.__EL, sentenceEnv, filteredDeclarations);
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


export const detectVariableReferences = (sentenceEnvsStruct: SentenceEnvsStruct, declarations: Declarations): WithErrorValue<{varRefs: ____VarRef[]}> => {

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
        );
        if (result){
            varRefs.push(...result.value.varRefs);
            errors.push(...result.errors);
        }
    }


    return { value: { varRefs }, errors };
};

export default detectVariableReferences;
