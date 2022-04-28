import * as std from "../../law/std";
import { Container } from "../../node/container";
import { SentenceEnv } from "../../node/container/sentenceEnv";
import { __Parentheses, __Text, ____LawNum, ____PointerRanges } from "../../node/el/controls";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import { isIgnoreAnalysis } from "../common";
import getScope from "../getScope";
import { SentenceEnvsStruct } from "../getSentenceEnvs";
import matchLawNum from "./matchLawNum";
import { matchPointerRanges } from "./matchPointerRanges";

export interface TokensStruct {
    pointerRangesList: ____PointerRanges[],
    lawNums: ____LawNum[],
}


export const detectTokensByEL = (
    elToBeModified: std.StdEL | std.__EL,
    prevLocatedContainerForSame: Container | null,
    __prevLocatedContainerForNamed: Container | null,
    sentenceEnv: SentenceEnv,
): {
    result: WithErrorValue<TokensStruct>,
    lastLocatedContainer: Container | null,
} => {

    const prevLocatedContainerForNamed = __prevLocatedContainerForNamed;

    const pointerRangesList: ____PointerRanges[] = [];
    const lawNums: ____LawNum[] = [];
    const errors: ErrorMessage[] = [];

    let containerForNamedForNextChildren: Container | null = prevLocatedContainerForNamed;

    for (let childIndex = 0; childIndex < elToBeModified.children.length; childIndex++) {

        const child = elToBeModified.children[childIndex];

        if (isIgnoreAnalysis(child)) {
            continue;

        } else if (typeof child === "string") {
            continue;

        } else if (child instanceof __Parentheses && child.attr.type === "square") {
            continue;

        } else if (child instanceof __Text) {
            containerForNamedForNextChildren = prevLocatedContainerForNamed;

            {
                // match before pointerRanges
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
                const match = matchPointerRanges(child);
                if (match) {
                    const pointerRanges = match.value.pointerRanges;
                    const getScopeResult = getScope(
                        sentenceEnv.container,
                        prevLocatedContainerForSame,
                        prevLocatedContainerForNamed,
                        pointerRanges,
                    );
                    prevLocatedContainerForSame = getScopeResult.lastLocatedContainer;
                    containerForNamedForNextChildren = getScopeResult.lastLocatedContainer;

                    pointerRangesList.push(pointerRanges);
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
                prevLocatedContainerForSame,
                containerForNamedForNextChildren,
                sentenceEnv,
            );
            prevLocatedContainerForSame = newResult.lastLocatedContainer;
            pointerRangesList.push(...newResult.result.value.pointerRangesList);
            lawNums.push(...newResult.result.value.lawNums);
            errors.push(...newResult.result.errors);
        }
    }

    return {
        result: {
            value: {
                pointerRangesList,
                lawNums,
            },
            errors,
        },
        lastLocatedContainer: prevLocatedContainerForSame,
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

        const newResult = detectTokensByEL(
            sentenceEnv.el,
            prevLocatedContainer, // use previous naming for RelPos.SAME
            null, // reset naming for RelPos.NAMED
            sentenceEnv,
        );
        prevLocatedContainer = newResult.lastLocatedContainer;
        prevContainerID = containerID;

        pointerRangesList.push(...newResult.result.value.pointerRangesList);
        lawNums.push(...newResult.result.value.lawNums);
        errors.push(...newResult.result.errors);
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
