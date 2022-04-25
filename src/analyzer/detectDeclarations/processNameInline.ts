import { SentenceEnvsStruct } from "../getSentenceEnvs";
import { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { __Parentheses, ____Declaration } from "../../node/el/controls";
import { Container, ContainerType } from "../../node/container";
import $nameInline from "../sentenceChildrenParser/rules/$nameInline";
import { initialEnv } from "../sentenceChildrenParser/env";
import { SentenceChildEL } from "../../node/cst/inline";
import getScope from "../getScope";
import { SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";

export const processNameInline = (
    sentenceEnv: SentenceEnv,
    _sentenceEnvsStruct: SentenceEnvsStruct,
    container: Container,
): (
    | WithErrorValue<{
        declaration: ____Declaration,
    }>
    | null
) => {
    const errors: ErrorMessage[] = [];

    for (let i = 0; i < sentenceEnv.el.children.length; i++) {
        const result = $nameInline.match(
            i,
            (sentenceEnv.el.children as SentenceChildEL[]),
            initialEnv({ target: "" }),
        );

        if (result.ok) {
            const { nameSquareParenthesesOffset, following, pointerRanges } = result.value.value;

            const nameSquareParentheses = sentenceEnv.el.children[nameSquareParenthesesOffset] as __Parentheses;

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
                                sentenceIndex: [...sentenceEnv.container.parents(p => p.type === ContainerType.TOPLEVEL)][0].sentenceRange[1] + 1,
                                textOffset: 0,
                            },
                        },
                    ]
            );

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
