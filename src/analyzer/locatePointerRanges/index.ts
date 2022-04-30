import * as std from "../../law/std";
import { Container } from "../../node/container";
import { SentenceEnv } from "../../node/container/sentenceEnv";
import { ____PointerRanges } from "../../node/el/controls";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import { isIgnoreAnalysis } from "../common";
import getScope, { OnBeforeModifierParentheses } from "../getScope";
import { SentenceEnvsStruct } from "../getSentenceEnvs";

export interface TokensStruct {
    pointerRangesList: ____PointerRanges[],
}


export const locatePointerRangesForEL = (
    elToBeModified: std.StdEL | std.__EL,
    __prevLocatedContainerForSame: Container | null,
    __prevLocatedContainerForNamed: Container | null,
    sentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
): (
    WithErrorValue<{
        pointerRangesList: ____PointerRanges[],
        lastLocatedContainer: Container | null,
    }> | null
) => {
    if (typeof elToBeModified === "string") {
        return null;

    } else if (isIgnoreAnalysis(elToBeModified)) {
        return null;
    }

    const pointerRangesList: ____PointerRanges[] = [];
    const errors: ErrorMessage[] = [];
    const prevLocatedContainerForNamed = __prevLocatedContainerForNamed;
    let prevLocatedContainerForSame = __prevLocatedContainerForSame;
    let containerForNamedForNextChildren: Container | null = prevLocatedContainerForNamed;

    for (const child of elToBeModified.children) {
        if (typeof child === "string") {
            continue;

        } else if (isIgnoreAnalysis(child)) {
            continue;
        }

        if (child instanceof ____PointerRanges) {
            const onBeforeModifierParentheses: OnBeforeModifierParentheses = (
                modifierParentheses,
                _,
                prevLocatedContainerForSame,
                prevLocatedContainerForNamed,
            ) => {
                const result = locatePointerRangesForEL(
                    modifierParentheses,
                    prevLocatedContainerForSame,
                    prevLocatedContainerForNamed,
                    sentenceEnv,
                    sentenceEnvsStruct,
                );
                if (!result) return { lastLocatedContainer: null };
                pointerRangesList.push(...result.value.pointerRangesList);
                errors.push(...result.errors);
                return { lastLocatedContainer: result.value.lastLocatedContainer };
            };

            const pointerRanges = child;
            pointerRangesList.push(pointerRanges);

            const getScopeResult = getScope(
                sentenceEnv.container,
                prevLocatedContainerForSame,
                prevLocatedContainerForNamed,
                pointerRanges,
                onBeforeModifierParentheses,
            );
            prevLocatedContainerForSame = getScopeResult.lastLocatedContainer;
            containerForNamedForNextChildren = getScopeResult.lastLocatedContainer;

        } else {

            const result = locatePointerRangesForEL(
                child as std.StdEL | std.__EL,
                prevLocatedContainerForSame,
                containerForNamedForNextChildren,
                sentenceEnv,
                sentenceEnvsStruct,
            );
            if (!result) continue;
            prevLocatedContainerForSame = result.value.lastLocatedContainer;
            pointerRangesList.push(...result.value.pointerRangesList);
            errors.push(...result.errors);
        }

    }

    return {
        value: {
            pointerRangesList,
            lastLocatedContainer: prevLocatedContainerForSame,
        },
        errors,
    };
};


export const locatePointerRanges = (sentenceEnvsStruct: SentenceEnvsStruct): WithErrorValue<____PointerRanges[]> => {

    const pointerRangesList: ____PointerRanges[] = [];
    const errors: ErrorMessage[] = [];

    let prevLocatedContainer: Container | null = null;
    let prevContainerID: string | null = null;

    for (const sentenceEnv of sentenceEnvsStruct.sentenceEnvs) {
        const containerID = sentenceEnv.container.containerID;
        if (containerID !== prevContainerID) prevLocatedContainer = null;

        {
            const result = locatePointerRangesForEL(
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
        value: pointerRangesList,
        errors,
    };
};

export default locatePointerRanges;
