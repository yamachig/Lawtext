import { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { ____Declaration } from "../../node/el/controls";
import { ContainerType } from "../../node/container";
import $nameInline from "../sentenceChildrenParser/rules/$nameInline";
import { initialEnv } from "../sentenceChildrenParser/env";
import { SentenceChildEL } from "../../node/cst/inline";
import { toSentenceTextRanges, SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";
import * as std from "../../law/std";
import { SentenceEnvsStruct } from "../getSentenceEnvs";

export const processNameInline = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
): (
    WithErrorValue<{
        declarations: ____Declaration[],
    }>
) => {
    const errors: ErrorMessage[] = [];
    const declarations: ____Declaration[] = [];

    for (let i = 0; i < elToBeModified.children.length; i++) {
        const result = $nameInline.match(
            i,
            (elToBeModified.children as SentenceChildEL[]),
            initialEnv({ target: "" }),
        );

        if (result.ok) {
            const { nameSquareParentheses, following, pointerRanges } = result.value.value;

            errors.push(...result.value.errors);

            const name = nameSquareParentheses.content.text();

            const followingStartPos = following ? {
                sentenceIndex: sentenceEnv.index,
                textOffset: sentenceEnv.textRageOfEL(nameSquareParentheses)?.[1] ?? 0,
            } : null;

            const scope = (
                pointerRanges
                    ? toSentenceTextRanges(
                        pointerRanges.targetContainerIDRanges,
                        sentenceEnvsStruct,
                        followingStartPos,
                    )
                    : [
                        {
                            start: {
                                sentenceIndex: sentenceEnv.index,
                                textOffset: sentenceEnv.textRageOfEL(nameSquareParentheses)?.[1] ?? 0,
                            },
                            end: {
                                sentenceIndex: (sentenceEnv.container.thisOrClosest(p => p.type === ContainerType.TOPLEVEL || p.type === ContainerType.ROOT)?.sentenceRange[1] ?? Number.NaN) + 1,
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
            declarations.push(declaration);

            nameSquareParentheses.content.children.splice(
                0,
                nameSquareParentheses.content.children.length,
                declaration,
            );
        }
    }

    return {
        value: { declarations },
        errors,
    };
};
