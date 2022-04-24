import { SpansStruct } from "../getSpans";
import * as std from "../../law/std";
import { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { __Parentheses, ____Declaration } from "../../node/el/controls";
import { Container } from "../../node/container";
import $nameInline from "../sentenceChildrenParser/rules/$nameInline";
import { initialEnv } from "../sentenceChildrenParser/env";
import { SentenceChildEL } from "../../node/cst/inline";
import getScope from "../getScope";
import { SpanTextPos } from "../../node/span/spanTextPos";

export const processNameInline = (
    els: (std.StdEL | std.__EL)[],
    spansStruct: SpansStruct,
    container: Container,
): (
    | WithErrorValue<{
        declaration: ____Declaration,
    }>
    | null
) => {
    const errors: ErrorMessage[] = [];

    for (let i = 0; i < els.length; i++) {
        const result = $nameInline.match(
            i,
            (els as SentenceChildEL[]),
            initialEnv({ target: "" }),
        );

        if (result.ok) {
            const { nameSquareParenthesesOffset, following, pointerRanges } = result.value.value;

            const nameSquareParentheses = els[nameSquareParenthesesOffset] as __Parentheses;

            errors.push(...result.value.errors);

            const name = nameSquareParentheses.content.text();

            const nameSpanIndex = (spansStruct.spansByEL.get(nameSquareParentheses)?.index ?? Number.NaN);

            const scope = pointerRanges
                ? getScope(
                    container,
                    pointerRanges,
                    following,
                    nameSpanIndex + 1,
                )
                : [
                    {
                        startSpanIndex: nameSpanIndex + 1,
                        startTextIndex: 0,
                        endSpanIndex: spansStruct.spans.length,
                        endTextIndex: 0,
                    },
                ];

            const namePos: SpanTextPos = {
                spanIndex: nameSpanIndex,
                textIndex: 0,
                length: name.length,
                range: nameSquareParentheses.content.range,
            };

            const declarationID = `decl-span_${Number.isFinite(nameSpanIndex) ? nameSpanIndex : nameSquareParentheses.content.id}-len_${name.length}`;

            const declaration = new ____Declaration({
                declarationID,
                type: "Keyword",
                name,
                value: null,
                scope: scope,
                namePos: namePos,
                range: nameSquareParentheses.content.range,
            });

            nameSquareParentheses.content.children.splice(
                0,
                nameSquareParentheses.content.children.length,
                declaration,
            );

            return {
                value: { declaration },
                errors,
            };
        }
    }
    return null;
};
