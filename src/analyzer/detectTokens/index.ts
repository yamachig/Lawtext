import * as std from "../../law/std";
import { Container } from "../../node/container";
import { SentenceEnv } from "../../node/container/sentenceEnv";
import { __Parentheses, __Text, ____LawNum, ____PointerRanges } from "../../node/el/controls";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import { isIgnoreAnalysis } from "../common";
import { SentenceEnvsStruct } from "../getSentenceEnvs";
import matchLawNum from "./matchLawNum";
import detectPointerRangesForEL from "./detectPointerRangesForEL";
import matchPointer from "./matchPointer";

export interface TokensStruct {
    pointerRangesList: ____PointerRanges[],
    lawNums: ____LawNum[],
}


export const detectTokensByEL = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
): WithErrorValue<{
    lawNums: ____LawNum[],
}> => {
    const lawNums: ____LawNum[] = [];
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
            // containerForNamedForNextChildren = prevLocatedContainerForNamed;

            {
                // match before pointer
                const match = matchLawNum(child);
                if (match) {
                    lawNums.push(match.value.lawNum);
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

            {
                const match = matchPointer(child);
                if (match) {
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

        } else {
            const newResult = detectTokensByEL(
                child as std.StdEL | std.__EL,
                sentenceEnv,
            );
            lawNums.push(...newResult.value.lawNums);
            errors.push(...newResult.errors);
        }
    }

    return {
        value: {
            lawNums,
        },
        errors,
    };
};


export const detectTokens = (sentenceEnvsStruct: SentenceEnvsStruct): WithErrorValue<TokensStruct> => {

    const pointerRangesList: ____PointerRanges[] = [];
    const lawNums: ____LawNum[] = [];
    const errors: ErrorMessage[] = [];

    let prevLocatedContainer: Container | null = null;
    let prevContainerID: string | null = null;

    for (const sentenceEnv of sentenceEnvsStruct.sentenceEnvs) {
        const containerID = sentenceEnv.container.containerID;
        if (containerID !== prevContainerID) prevLocatedContainer = null;

        {
            const result = detectTokensByEL(
                sentenceEnv.el,
                sentenceEnv,
            );
            lawNums.push(...result.value.lawNums);
            errors.push(...result.errors);
        }

        {
            const result = detectPointerRangesForEL(
                sentenceEnv.el,
                prevLocatedContainer, // use previous naming for RelPos.SAME
                null, // reset naming for RelPos.NAMED
                sentenceEnv,
                sentenceEnvsStruct,
            );
            if (result){
                pointerRangesList.push(...result.value.pointerRangesList);

                prevLocatedContainer = result.value.lastLocatedContainer;
                prevContainerID = containerID;
                errors.push(...result.errors);
            }
        }

    }

    return {
        value: {
            pointerRangesList,
            lawNums,
        },
        errors,
    };
};

export default detectTokens;
