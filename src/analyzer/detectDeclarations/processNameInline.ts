import { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { __Parentheses, ____Declaration } from "../../node/el/controls";
import { Container, ContainerType } from "../../node/container";
import $nameInline from "../sentenceChildrenParser/rules/$nameInline";
import { initialEnv } from "../sentenceChildrenParser/env";
import { SentenceChildEL } from "../../node/cst/inline";
import getScope from "../getScope";
import { SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";
import * as std from "../../law/std";

export const processNameInline = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    container: Container,
): (
    | WithErrorValue<{
        declaration: ____Declaration,
    }>
    | null
) => {
    const errors: ErrorMessage[] = [];

    for (let i = 0; i < elToBeModified.children.length; i++) {
        const result = $nameInline.match(
            i,
            (elToBeModified.children as SentenceChildEL[]),
            initialEnv({ target: "" }),
        );

        if (result.ok) {
            const { nameSquareParenthesesOffset, following, pointerRanges } = result.value.value;

            const nameSquareParentheses = elToBeModified.children[nameSquareParenthesesOffset] as __Parentheses;

            errors.push(...result.value.errors);

            const name = nameSquareParentheses.content.text();

            const scope = (
                pointerRanges
                    ? getScope(
                        container,
                        pointerRanges,
                        following,
                        sentenceEnv.index + 1,
                    )
                    : [
                        {
                            start: {
                                sentenceIndex: sentenceEnv.index + 1,
                                textOffset: 0,
                            },
                            end: {
                                sentenceIndex: [...sentenceEnv.container.parents(p => p.type === ContainerType.TOPLEVEL || p.type === ContainerType.ROOT)][0].sentenceRange[1] + 1,
                                textOffset: 0,
                            },
                        },
                    ]
            );

            if (scope.length === 0) {
                errors.push(new ErrorMessage(
                    "No scope found",
                    [
                        { offset: pointerRanges?.range?.[0] ?? 0, line: 0, column: 0 },
                        { offset: pointerRanges?.range?.[1] ?? 0, line: 0, column: 0 },
                    ],
                ));
            }

            const nameTextRange = sentenceEnv.textRageOfEL(nameSquareParentheses.content);
            if (!nameTextRange) {
                throw new Error("nameTextRange is null");
            }

            const nameSentenceTextRange: SentenceTextRange = {
                start: {
                    sentenceIndex: sentenceEnv.index,
                    textOffset: nameTextRange[0],
                },
                end: {
                    sentenceIndex: sentenceEnv.index,
                    textOffset: nameTextRange[1],
                },
            };

            const declarationID = `decl-sentence_${sentenceEnv.index}-text_${nameTextRange[0]}_${nameTextRange[1]}`;

            const declaration = new ____Declaration({
                declarationID,
                type: "Keyword",
                name,
                value: null,
                scope: scope,
                nameSentenceTextRange,
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
