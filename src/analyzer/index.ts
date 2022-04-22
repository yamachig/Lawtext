import { EL } from "../node/el";
import getSpans from "./getSpans";
import detectDeclarations from "./detectDeclarations";
import detectVariableReferences from "./detectVariableReferences";
import { Container } from "../node/container";
import { Span } from "../node/span";
import { Declarations } from "./common/declaration";
import { ____VarRef } from "./common/varRef";


export interface Analysis {
    declarations: Declarations,
    variableReferences: ____VarRef[],
    spans: Span[],
    containers: Container[],
    rootContainer: Container,
}

export const analyze = (elToBeModified: EL): Analysis => {
    const { spans, containers, rootContainer } = getSpans(elToBeModified);
    const declarations = detectDeclarations(spans);
    const variableReferences = detectVariableReferences(spans, declarations);
    return {
        declarations,
        variableReferences,
        spans,
        containers,
        rootContainer,
    };
};
