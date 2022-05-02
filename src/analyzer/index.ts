import getSentenceEnvs, { SentenceEnvsStruct } from "./getSentenceEnvs";
import detectVariableReferences from "./detectVariableReferences";
import { Declarations } from "./common/declarations";
import { ____VarRef } from "../node/el/controls/varRef";
import * as std from "../law/std";
import { ErrorMessage } from "../parser/cst/error";
import detectTokens, { TokensStruct } from "./locatePointerRanges";
import detectDeclarations from "./detectDeclarations";


export interface Analysis extends TokensStruct, SentenceEnvsStruct {
    declarations: Declarations,
    variableReferences: ____VarRef[],
    errors: ErrorMessage[],
}

export const analyze = (elToBeModified: std.StdEL | std.__EL): Analysis => {
    const errors: ErrorMessage[] = [];

    const sentenceEnvsStruct = getSentenceEnvs(elToBeModified);

    const detectTokensResult = detectTokens(sentenceEnvsStruct);
    errors.push(...detectTokensResult.errors);

    const detectDeclarationsResult = detectDeclarations(sentenceEnvsStruct);
    const declarations = detectDeclarationsResult.value;
    errors.push(...detectDeclarationsResult.errors);

    const detectVariableReferencesResult = detectVariableReferences(sentenceEnvsStruct, declarations);
    const variableReferences = detectVariableReferencesResult.value.varRefs;
    errors.push(...detectVariableReferencesResult.errors);

    return {
        pointerRangesList: detectTokensResult.value,
        declarations,
        variableReferences,
        ...sentenceEnvsStruct,
        errors,
    };
};
