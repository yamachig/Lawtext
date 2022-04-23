import getSpans from "./getSpans";
import detectDeclarations from "./detectDeclarations";
import detectVariableReferences from "./detectVariableReferences";
import { Container } from "../node/container";
import { Span } from "../node/span";
import { Declarations } from "./common/declarations";
import { ____VarRef } from "../node/el/controls/varRef";
import detectPointerRanges from "./detectPointerRanges";
import * as std from "../law/std";
import { ____PointerRanges } from "../node/el/controls";


export interface Analysis {
    pointerRangesList: ____PointerRanges[],
    declarations: Declarations,
    variableReferences: ____VarRef[],
    spans: Span[],
    containers: Map<string, Container>,
    rootContainer: Container,
}

export const analyze = (elToBeModified: std.StdEL | std.__EL): Analysis => {
    const pointerRangesList = detectPointerRanges(elToBeModified);
    const { spans, containers, rootContainer } = getSpans(elToBeModified);
    const declarations = detectDeclarations(spans);
    const variableReferences = detectVariableReferences(spans, declarations);
    return {
        pointerRangesList,
        declarations,
        variableReferences,
        spans,
        containers,
        rootContainer,
    };
};
