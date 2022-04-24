import getSpans, { SpansStruct } from "./getSpans";
import detectDeclarations from "./detectDeclarations";
import detectVariableReferences from "./detectVariableReferences";
import { Declarations } from "./common/declarations";
import { ____VarRef } from "../node/el/controls/varRef";
import detectPointerRanges from "./detectPointerRanges";
import * as std from "../law/std";
import { ____PointerRanges } from "../node/el/controls";
import { ErrorMessage } from "../parser/cst/error";


export interface Analysis extends SpansStruct {
    pointerRangesList: ____PointerRanges[],
    declarations: Declarations,
    variableReferences: ____VarRef[],
    errors: ErrorMessage[],
}

export const analyze = (elToBeModified: std.StdEL | std.__EL): Analysis => {
    const errors: ErrorMessage[] = [];

    const detectPointerRangesResult = detectPointerRanges(elToBeModified);
    errors.push(...detectPointerRangesResult.errors);

    const spansStruct = getSpans(elToBeModified);

    const detectDeclarationsResult = detectDeclarations(elToBeModified, spansStruct);
    const declarations = detectDeclarationsResult.value;
    errors.push(...detectDeclarationsResult.errors);

    const variableReferences = detectVariableReferences(spansStruct.spans, declarations);

    return {
        pointerRangesList: detectPointerRangesResult.value,
        declarations,
        variableReferences,
        ...spansStruct,
        errors,
    };
};
