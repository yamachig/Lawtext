import { SpansStruct } from "../getSpans";
import * as std from "../../law/std";
import { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { __Parentheses, ____Declaration } from "../../node/el/controls";
import { Container } from "../../node/container";
import { isSpanEL } from "../../node/span";
import { ignoreAnalysisTag } from "../common";
import $nameInline from "../sentenceChildrenParser/rules/$nameInline";
import { initialEnv } from "../sentenceChildrenParser/env";
import { SentenceChildEL } from "../../node/cst/inline";
import getScope from "../getScope";
import { SpanTextPos } from "../../node/span/spanTextPos";


export const detectNameInline = (elToBeModified: std.StdEL | std.__EL, spansStruct: SpansStruct, prevContainer: Container): WithErrorValue<____Declaration[]> => {

    const declarations: ____Declaration[] = [];
    const errors: ErrorMessage[] = [];

    const container = spansStruct.containersByEL.get(elToBeModified) ?? prevContainer;

    if (elToBeModified.children.some(isSpanEL)) {
        for (let childIndex = 0; childIndex < elToBeModified.children.length; childIndex++) {
            const result = $nameInline.match(
                childIndex,
                (elToBeModified.children as SentenceChildEL[]),
                initialEnv({ target: "" }),
            );

            if (result.ok) {
                const { nameSquareParenthesesOffset, following, pointerRanges } = result.value.value;

                const nameSquareParentheses = elToBeModified.children[nameSquareParenthesesOffset] as __Parentheses;

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
                declarations.push(declaration);

                nameSquareParentheses.content.children.splice(
                    0,
                    nameSquareParentheses.content.children.length,
                    declaration,
                );

                childIndex = result.nextOffset - 2;
            }
        }

    }


    for (const child of elToBeModified.children) {
        if (typeof child === "string") {
            continue;

        } else if ((ignoreAnalysisTag as readonly string[]).includes(child.tag)) {
            continue;

        } else {
            const detectLawnameResult = detectNameInline(
                child as std.StdEL | std.__EL,
                spansStruct,
                container,
            );
            declarations.push(...detectLawnameResult.value);
            errors.push(...detectLawnameResult.errors);

        }

    }


    return { value: declarations, errors };
};

export default detectNameInline;
