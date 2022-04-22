import { Span } from "../node/span";
import { EL } from "../node/el";
import { Declarations } from "./common/declarations";
import { ____VarRef } from "../node/el/controls/varRef";
import { SpanTextPos } from "../node/span/spanTextPos";


export const detectVariableReferences = (spans: Span[], declarations: Declarations) => {

    let variableReferences: ____VarRef[] = [];

    const detect = (span: Span) => {
        const parent = span.env.parents[span.env.parents.length - 1];
        if (parent.tag === "__PContent" && parent.attr.type === "square") return;
        const ret: ____VarRef[] = [];
        for (const declaration of declarations.getInSpan(span.index)) {
            const textScope = {
                start: 0,
                end: Number.POSITIVE_INFINITY,
            };
            let nextIndexOffset = 0;
            for (const child of span.el.children) {
                const indexOffset = nextIndexOffset;
                nextIndexOffset += (child instanceof EL ? child.text() : child).length;
                if (child instanceof EL) continue;

                let searchIndex = 0;
                while (true) {
                    const index = child.indexOf(declaration.attr.name, searchIndex);
                    if (index < 0) break;

                    searchIndex = index + declaration.attr.name.length;

                    if (textScope.start <= index && index < textScope.end) {
                        const refPos: SpanTextPos = {
                            spanIndex: span.index,
                            textIndex: index + indexOffset,
                            length: declaration.attr.name.length,
                            range: span.el.range && [
                                span.el.range[0] + index + indexOffset,
                                span.el.range[0] + index + indexOffset + declaration.attr.name.length,
                            ],
                        };

                        const range = span.el.range ? [
                            span.el.range[0] + index + indexOffset,
                            span.el.range[0] + searchIndex + indexOffset,
                        ] as [number, number] : null;

                        const varref = new ____VarRef({
                            refName: declaration.attr.name,
                            declarationID: declaration.attr.declarationID,
                            refPos: refPos,
                            range,
                        });
                        span.el.replaceSpan(index + indexOffset, searchIndex + indexOffset, varref);
                        ret.push(varref);
                    }

                }
            }
        }
        return ret;
    };

    for (const span of spans) {
        const varrefs = detect(span);
        if (varrefs) {
            variableReferences = variableReferences.concat(varrefs);
        }
    }

    return variableReferences;
};

export default detectVariableReferences;
