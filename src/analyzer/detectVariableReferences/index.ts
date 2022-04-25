
import * as std from "../../law/std";
import { Declarations } from "../common/declarations";
import { ____VarRef } from "../../node/el/controls/varRef";
import { SentenceEnvsStruct } from "../getSentenceEnvs";
import { __Text } from "../../node/el/controls";
import { WithErrorValue } from "../../parser/std/util";
import { SentenceChildEL } from "../../node/cst/inline";
import { ErrorMessage } from "../../parser/cst/error";
import { isSentenceText, SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";
import { ignoreAnalysisTags } from "../common";

export const matchVariableReference = (textEL: __Text, sentenceEnv: SentenceEnv, declarations: Declarations): (
    | WithErrorValue<{
        newItems: SentenceChildEL[],
        varRef: ____VarRef,
        proceedOffset: number,
    }>
    | null
) => {
    const errors: ErrorMessage[] = [];
    const text = textEL.text();

    for (const declaration of declarations.values()) {
        const name = declaration.attr.name;
        const nameOffset = text.indexOf(name);

        if (nameOffset < 0) continue;

        const newItems: SentenceChildEL[] = [];

        if (nameOffset > 0) {
            newItems.push(new __Text(
                text.substring(0, nameOffset),
                textEL.range && [textEL.range[0], textEL.range[0] + nameOffset],
            ));
        }

        const textRange = sentenceEnv.textRageOfEL(textEL);

        const refSentenceTextRange: SentenceTextRange = {
            start: {
                sentenceIndex: sentenceEnv.index,
                textOffset: (textRange?.[0] ?? Number.NaN) + nameOffset,
            },
            end: {
                sentenceIndex: sentenceEnv.index,
                textOffset: (textRange?.[0] ?? Number.NaN) + nameOffset + name.length,
            },
        };

        const range = (textEL.range) ? [
            textEL.range[0] + nameOffset,
            textEL.range[0] + nameOffset + name.length,
        ] as [number, number] : null;

        const varRef = new ____VarRef({
            refName: name,
            declarationID: declaration.attr.declarationID,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            refSentenceTextRange,
            range,
        });
        newItems.push(varRef);

        if (nameOffset + name.length < text.length) {
            newItems.push(new __Text(text.substring(nameOffset + name.length)));
        }

        return {
            value: {
                newItems,
                varRef,
                proceedOffset: nameOffset > 0 ? 1 : 2,
            },
            errors,
        };

    }

    return null;

};


export const detectVariableReferencesOfEL = (elToBeModified: std.StdEL | std.__EL, sentenceEnv: SentenceEnv, declarations: Declarations): WithErrorValue<{varRefs: ____VarRef[]}> => {

    const varRefs: ____VarRef[] = [];
    const errors: ErrorMessage[] = [];

    for (let childIndex = 0; childIndex < elToBeModified.children.length; childIndex++) {

        const child = elToBeModified.children[childIndex];

        if (typeof child === "string") {
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
                // match before pointerRanges
                const match = matchVariableReference(child, sentenceEnv, filteredDeclarations);
                if (match) {
                    varRefs.push(match.value.varRef);
                    errors.push(...match.errors);

                    elToBeModified.children.splice(
                        childIndex,
                        1,
                        ...match.value.newItems,
                    );

                    childIndex += match.value.proceedOffset - 1;
                    continue;
                }
            }

        } else if (isSentenceText(child)) {
            continue;

        } else if ((ignoreAnalysisTags as readonly string[]).includes(child.tag)) {
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
