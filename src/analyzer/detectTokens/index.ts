import * as std from "../../law/std";
import { __Text, ____PointerRanges } from "../../node/el/controls";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import { ignoreAnalysisTag } from "../common";
import { matchPointerRanges } from "./matchPointerRanges";

export interface TokensStruct {
    pointerRangesList: ____PointerRanges[],
}


export const detectTokens = (elToBeModified: std.StdEL | std.__EL): WithErrorValue<TokensStruct> => {

    const pointerRangesList: ____PointerRanges[] = [];
    const errors: ErrorMessage[] = [];

    for (let childIndex = 0; childIndex < elToBeModified.children.length; childIndex++) {

        const child = elToBeModified.children[childIndex];

        if (typeof child === "string") {
            continue;

        } else if (child instanceof __Text) {

            const pointerRangesResult = matchPointerRanges(child);
            if (pointerRangesResult) {
                pointerRangesList.push(pointerRangesResult.value.pointerRanges);
                errors.push(...pointerRangesResult.errors);

                elToBeModified.children.splice(
                    childIndex,
                    1,
                    ...pointerRangesResult.value.newItems,
                );

                childIndex += pointerRangesResult.value.proceedOffset - 1;
                continue;
            }

        } else if ((ignoreAnalysisTag as readonly string[]).includes(child.tag)) {
            continue;

        } else {
            const newResult = detectTokens(child as std.StdEL | std.__EL);
            pointerRangesList.push(...newResult.value.pointerRangesList);
            errors.push(...newResult.errors);
        }
    }

    return {
        value: {
            pointerRangesList,
        },
        errors,
    };
};

export default detectTokens;
