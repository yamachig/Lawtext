import getSentenceEnvs, { SentenceEnvsStruct } from "./getSentenceEnvs";
import detectVariableReferences from "./detectVariableReferences";
import { Declarations } from "./common/declarations";
import { ____VarRef } from "../node/el/controls/varRef";
import * as std from "../law/std";
import { ErrorMessage } from "../parser/cst/error";
import detectDeclarations from "./detectDeclarations";
import { ____PointerRanges } from "../node/el/controls";
import getPointerEnvs, { PointerEnvsStruct } from "./pointerEnvs/getPointerEnvs";
import getScope from "./pointerEnvs/getScope";


export interface Analysis extends SentenceEnvsStruct, PointerEnvsStruct {
    pointerRangesList: ____PointerRanges[];
    declarations: Declarations,
    variableReferences: ____VarRef[],
    errors: ErrorMessage[],
}

export const analyze = (elToBeModified: std.StdEL | std.__EL): Analysis => {
    const errors: ErrorMessage[] = [];

    const sentenceEnvsStruct = getSentenceEnvs(elToBeModified);

    const getPointerEnvsResult = getPointerEnvs(sentenceEnvsStruct);
    errors.push(...getPointerEnvsResult.errors);
    const pointerEnvsStruct = getPointerEnvsResult.value;

    // detectDeclarations partially locates PointerRanges, assuming the located PointerRanges are all internal.
    const detectDeclarationsResult = detectDeclarations(sentenceEnvsStruct, pointerEnvsStruct);
    const declarations = detectDeclarationsResult.value;
    errors.push(...detectDeclarationsResult.errors);

    // Locate remaining PointerRanges. This time, the remaining PointerRanges are located considering LawRef's.
    for (const pointerRanges of pointerEnvsStruct.pointerRangesList) {
        getScope(pointerRanges, pointerEnvsStruct);
    }

    const detectVariableReferencesResult = detectVariableReferences(sentenceEnvsStruct, declarations);
    const variableReferences = detectVariableReferencesResult.value.varRefs;
    errors.push(...detectVariableReferencesResult.errors);

    return {
        declarations,
        variableReferences,
        ...sentenceEnvsStruct,
        ...pointerEnvsStruct,
        errors,
    };
};
