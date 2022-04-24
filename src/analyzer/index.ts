import getSpans, { SpansStruct } from "./getSpans";
import detectVariableReferences from "./detectVariableReferences";
import { Declarations } from "./common/declarations";
import { ____VarRef } from "../node/el/controls/varRef";
import * as std from "../law/std";
import { ErrorMessage } from "../parser/cst/error";
import detectTokens, { TokensStruct } from "./detectTokens";
import detectDeclarations from "./detectDeclarations";


export interface Analysis extends TokensStruct, SpansStruct {
    declarations: Declarations,
    variableReferences: ____VarRef[],
    errors: ErrorMessage[],
}

export const analyze = (elToBeModified: std.StdEL | std.__EL): Analysis => {
    const errors: ErrorMessage[] = [];

    const detectTokensResult = detectTokens(elToBeModified);
    errors.push(...detectTokensResult.errors);

    const spansStruct = getSpans(elToBeModified);

    const detectDeclarationsResult = detectDeclarations(elToBeModified, spansStruct, spansStruct.rootContainer);
    const declarations = new Declarations();
    for (const declaration of detectDeclarationsResult.value) declarations.add(declaration);
    errors.push(...detectDeclarationsResult.errors);

    const variableReferences = detectVariableReferences(spansStruct.spans, declarations);

    return {
        ...detectTokensResult.value,
        declarations,
        variableReferences,
        ...spansStruct,
        errors,
    };
};
