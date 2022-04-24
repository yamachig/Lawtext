import * as std from "../../law/std";
import { ____PointerRanges } from "../../node/el/controls";
import { ErrorMessage } from "../../parser/cst/error";
import { WithErrorValue } from "../../parser/std/util";
import detectPointerRanges from "./detectPointerRanges";

export interface TokensStruct {
    pointerRangesList: ____PointerRanges[],
}

export const detectTokens = (elToBeModified: std.StdEL | std.__EL): WithErrorValue<TokensStruct> => {
    const errors: ErrorMessage[] = [];

    const detectPointerRangesResult = detectPointerRanges(elToBeModified);
    errors.push(...detectPointerRangesResult.errors);

    return {
        value: {
            pointerRangesList: detectPointerRangesResult.value,
        },
        errors,
    };
};

export default detectTokens;
