import type { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { ____Declaration } from "../../node/el/controls";
import $nameInline from "../sentenceChildrenParser/rules/$nameInline";
import { initialEnv } from "../sentenceChildrenParser/env";
import type { SentenceChildEL } from "../../node/cst/inline";
import type { SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";
import { toSentenceTextRanges } from "../../node/container/sentenceEnv";
import type * as std from "../../law/std";
import type { SentenceEnvsStruct } from "../getSentenceEnvs";
import getScope from "../pointerEnvs/getScope";
import type { PointerEnvsStruct } from "../pointerEnvs/getPointerEnvs";

export const processNameInline = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
    pointerEnvsStruct: PointerEnvsStruct,
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

            if (pointerRanges) getScope(pointerRanges, pointerEnvsStruct);

            errors.push(...result.value.errors);

            const name = nameSquareParentheses.content.text();

            const followingStartPos = following ? {
                sentenceIndex: sentenceEnv.index,
                textOffset: sentenceEnv.textRageOfEL(nameSquareParentheses)?.[1] ?? 0,
            } : null;

            const scope = toSentenceTextRanges(
                pointerRanges?.targetContainerIDRanges ?? null,
                sentenceEnvsStruct,
                followingStartPos,
            );

            if (scope.length === 0) {
                errors.push(new ErrorMessage(
                    "No scope found",
                    [
                        pointerRanges?.range?.[0] ?? 0,
                        pointerRanges?.range?.[1] ?? 0,
                    ],
                ));
            }

            const nameTextRange = sentenceEnv.textRageOfEL(nameSquareParentheses.content);
            if (!nameTextRange) {
                errors.push(new ErrorMessage(
                    "nameTextRange is null",
                    [
                        pointerRanges?.range?.[0] ?? 0,
                        pointerRanges?.range?.[1] ?? 0,
                    ],
                ));
                continue;
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
                children: [name],
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
