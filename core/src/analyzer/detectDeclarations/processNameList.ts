import { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { __Parentheses, __Text, ____Declaration } from "../../node/el/controls";
import $nameListHead from "../sentenceChildrenParser/rules/$nameListHead";
import { initialEnv } from "../sentenceChildrenParser/env";
import { SentenceChildEL } from "../../node/cst/inline";
import { SentenceEnv, SentenceTextRange, toSentenceTextRanges } from "../../node/container/sentenceEnv";
import * as std from "../../law/std";
import { SentenceEnvsStruct } from "../getSentenceEnvs";
import getScope from "../pointerEnvs/getScope";
import { PointerEnvsStruct } from "../pointerEnvs/getPointerEnvs";

export const processNameList = (
    headSentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
    pointerEnvsStruct: PointerEnvsStruct,
): (
    WithErrorValue<____Declaration[]>
) => {
    const errors: ErrorMessage[] = [];
    const declarations: ____Declaration[] = [];


    const result = $nameListHead.match(
        0,
        (headSentenceEnv.el.children as SentenceChildEL[]),
        initialEnv({ target: "" }),
    );

    if (result.ok) {
        const { pointerRanges } = result.value.value;

        if (pointerRanges) getScope(pointerRanges, pointerEnvsStruct);

        const scope = toSentenceTextRanges(
            pointerRanges.targetContainerIDRanges,
            sentenceEnvsStruct,
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

        for (const nameContainer of headSentenceEnv.container.children) {

            const paragraphItemSentence = nameContainer.el.children.find(std.isParagraphItemSentence);

            if (!paragraphItemSentence || paragraphItemSentence.children.length === 0) continue;

            if (paragraphItemSentence.children.every(std.isSentence)) {
                const sentence = paragraphItemSentence.children[0];
                if (sentence.children.length <= 1) continue;

                const sentenceEnv = sentenceEnvsStruct.sentenceEnvByEL.get(sentence);
                if (!sentenceEnv) continue;

                const nameChild = sentence.children[0];
                if (!(nameChild instanceof __Parentheses && nameChild.attr.type === "square")) continue;
                const name = nameChild.content.text();

                const afterNameChild = sentence.children[1];
                if (!(afterNameChild instanceof __Text)) continue;

                const afterNameMatch = /^とは、/.exec(afterNameChild.text());
                if (!afterNameMatch) continue;

                const lastChild = sentence.children[sentence.children.length - 1];
                if (!(lastChild instanceof __Text)) continue;
                const lastMatch = /をいう。$/.exec(lastChild.text());
                if (!lastMatch) continue;

                const nameTextRange = sentenceEnv.textRageOfEL(nameChild.content);
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

                const declarationID = `decl-sentence_${sentenceEnv.index}-text_${nameSentenceTextRange.start.textOffset}_${nameSentenceTextRange.end.textOffset}`;

                const declaration = new ____Declaration({
                    declarationID,
                    type: "Keyword",
                    name,
                    value: sentence.text().slice(nameChild.text().length + afterNameMatch[0].length, -lastMatch[0].length),
                    scope: scope,
                    nameSentenceTextRange,
                    range: nameChild.content.range,
                    children: [name],
                });
                declarations.push(declaration);

                nameChild.content.children.splice(
                    0,
                    nameChild.content.children.length,
                    declaration,
                );

            } else if (paragraphItemSentence.children.every(std.isColumn)) {
                if (paragraphItemSentence.children.length !== 2) continue;
                const [nameColumn, defColumn] = paragraphItemSentence.children;
                if (nameColumn.children.length !== 1) continue;
                const nameSentence = nameColumn.children[0];
                if (!std.isSentence(nameSentence)) continue;

                const name = nameSentence.text();

                const nameSentenceEnv = sentenceEnvsStruct.sentenceEnvByEL.get(nameSentence);
                if (!nameSentenceEnv) continue;

                const nameSentenceTextRange: SentenceTextRange = {
                    start: {
                        sentenceIndex: nameSentenceEnv.index,
                        textOffset: 0,
                    },
                    end: {
                        sentenceIndex: nameSentenceEnv.index,
                        textOffset: name.length,
                    },
                };

                const declarationID = `decl-sentence_${nameSentenceEnv.index}-text_${nameSentenceTextRange.start.textOffset}_${nameSentenceTextRange.end.textOffset}`;

                const declaration = new ____Declaration({
                    declarationID,
                    type: "Keyword",
                    name,
                    value: defColumn.text(),
                    scope: scope,
                    nameSentenceTextRange,
                    range: nameSentence.range ? [
                        nameSentence.range[0],
                        nameSentence.range[0] + name.length,
                    ] : null,
                    children: [name],
                });
                declarations.push(declaration);

                nameSentence.children.splice(
                    0,
                    1,
                    declaration,
                );
            }
        }
    }


    return {
        value: declarations,
        errors,
    };
};
