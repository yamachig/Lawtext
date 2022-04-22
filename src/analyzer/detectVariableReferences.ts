import { Span } from "../node/span";
import { EL } from "../node/el";
import { Declarations } from "./common/declaration";
import { ____VarRef } from "./common/varRef";
import { Pos } from "./common/pos";


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
                nextIndexOffset += (child instanceof EL ? child.text : child).length;
                if (child instanceof EL) continue;

                let searchIndex = 0;
                while (true) {
                    const index = child.indexOf(declaration.name, searchIndex);
                    if (index < 0) break;

                    searchIndex = index + declaration.name.length;

                    if (textScope.start <= index && index < textScope.end) {
                        const refPos: Pos = {
                            spanIndex: span.index,
                            textIndex: index + indexOffset,
                            length: declaration.name.length,
                            range: span.el.range && [
                                span.el.range[0] + index + indexOffset,
                                span.el.range[0] + index + indexOffset + declaration.name.length,
                            ],
                        };

                        const range = span.el.range ? [
                            span.el.range[0] + index + indexOffset,
                            span.el.range[0] + searchIndex + indexOffset,
                        ] as [number, number] : null;

                        const varref = new ____VarRef({
                            refName: declaration.name,
                            declaration: declaration,
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
