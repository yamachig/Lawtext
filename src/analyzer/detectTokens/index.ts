import * as std from "../../law/std";
import { __Text, ____LawNum, ____PointerRanges } from "../../node/el/controls";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import { ignoreAnalysisTag } from "../common";
import matchLawNum from "./matchLawNum";
import { matchPointerRanges } from "./matchPointerRanges";

export interface TokensStruct {
    pointerRangesList: ____PointerRanges[],
    lawNums: ____LawNum[],
}


export const detectTokens = (elToBeModified: std.StdEL | std.__EL): WithErrorValue<TokensStruct> => {

    const pointerRangesList: ____PointerRanges[] = [];
    const lawNums: ____LawNum[] = [];
    const errors: ErrorMessage[] = [];

    for (let childIndex = 0; childIndex < elToBeModified.children.length; childIndex++) {

        const child = elToBeModified.children[childIndex];

        if (typeof child === "string") {
            continue;

        } else if (child instanceof __Text) {

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
                    pointerRangesList.push(match.value.pointerRanges);
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

        } else if ((ignoreAnalysisTag as readonly string[]).includes(child.tag)) {
            continue;

        } else {
            const newResult = detectTokens(child as std.StdEL | std.__EL);
            pointerRangesList.push(...newResult.value.pointerRangesList);
            lawNums.push(...newResult.value.lawNums);
            errors.push(...newResult.errors);
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
