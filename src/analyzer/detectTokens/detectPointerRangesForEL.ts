import { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { ____PointerRanges } from "../../node/el/controls";
import { Container } from "../../node/container";
import { initialEnv } from "../sentenceChildrenParser/env";
import { SentenceChildEL } from "../../node/cst/inline";
import { SentenceEnv } from "../../node/container/sentenceEnv";
import * as std from "../../law/std";
import { SentenceEnvsStruct } from "../getSentenceEnvs";
import $pointerRanges from "../sentenceChildrenParser/rules/$pointerRanges";
import getScope, { OnBeforeModifierParentheses } from "../getScope";
import { isIgnoreAnalysis } from "../common";


export const detectPointerRangesForEL = (
    elToBeModified: std.StdEL | std.__EL,
    prevLocatedContainerForSame: Container | null,
    __prevLocatedContainerForNamed: Container | null,
    sentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
): (
    WithErrorValue<{
        pointerRangesList: ____PointerRanges[],
        lastLocatedContainer: Container | null,
    }>
) => {

    const prevLocatedContainerForNamed = __prevLocatedContainerForNamed;
    let containerForNamedForNextChildren: Container | null = prevLocatedContainerForNamed;

    const pointerRangesList: ____PointerRanges[] = [];

    const errors: ErrorMessage[] = [];


    const onBeforeModifierParentheses: OnBeforeModifierParentheses = (
        modifierParentheses,
        _,
        prevLocatedContainerForSame,
        prevLocatedContainerForNamed,
    ) => {
        const result = detectPointerRangesForEL(
            modifierParentheses,
            prevLocatedContainerForSame,
            prevLocatedContainerForNamed,
            sentenceEnv,
            sentenceEnvsStruct,
        );
        return { lastLocatedContainer: result.value.lastLocatedContainer };
    };

    for (let i = 0; i < elToBeModified.children.length; i++) {
        const result = $pointerRanges.match(
            i,
            (elToBeModified.children as SentenceChildEL[]),
            initialEnv({ target: "" }),
        );

        if (result.ok) {
            const pointerRanges = result.value.value;
            pointerRangesList.push(pointerRanges);
            errors.push(...result.value.errors);

            const getScopeResult = getScope(
                sentenceEnv.container,
                prevLocatedContainerForSame,
                prevLocatedContainerForNamed,
                pointerRanges,
                onBeforeModifierParentheses,
            );
            prevLocatedContainerForSame = getScopeResult.lastLocatedContainer;
            containerForNamedForNextChildren = getScopeResult.lastLocatedContainer;

            elToBeModified.children.splice(
                i,
                result.nextOffset - i,
                pointerRanges,
            );

        } else {
            const child = elToBeModified.children[i];
            if (typeof child === "string") {
                continue;

            } else if (isIgnoreAnalysis(child)) {
                continue;

            } else {
                const detectPointerRangesForELResult = detectPointerRangesForEL(
                child as std.StdEL | std.__EL,
                prevLocatedContainerForSame,
                containerForNamedForNextChildren,
                sentenceEnv,
                sentenceEnvsStruct,
                );
                prevLocatedContainerForSame = detectPointerRangesForELResult.value.lastLocatedContainer;
                pointerRangesList.push(...detectPointerRangesForELResult.value.pointerRangesList);
                errors.push(...detectPointerRangesForELResult.errors);

            }

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

export default detectPointerRangesForEL;
