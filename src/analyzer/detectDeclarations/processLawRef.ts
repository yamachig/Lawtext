// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sha512 from "hash.js/lib/hash/sha/512";
import { LAWNUM_TABLE, KEY_LENGTH } from "../../law/lawNumTable";
import { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { __Text, ____Declaration } from "../../node/el/controls";
import { Container, ContainerType } from "../../node/container";
import $lawRef from "../sentenceChildrenParser/rules/$lawRef";
import { initialEnv } from "../sentenceChildrenParser/env";
import { SentenceChildEL } from "../../node/cst/inline";
import getScope from "../getScope";
import { SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";
import * as std from "../../law/std";

export const getLawNameLength = (lawNum: string): number => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const digest = sha512().update(lawNum).digest("hex") as string;
    const key = parseInt(digest.slice(0, KEY_LENGTH), 16);
    return LAWNUM_TABLE[key];
};

export const processLawRef = (
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
        const result = $lawRef.match(
            i,
            (elToBeModified.children as SentenceChildEL[]),
            initialEnv({ target: "" }),
        );

        if (result.ok) {
            const { lawNameCandidate, lawRefInfo: { aliasInfo, lawNum } } = result.value.value;
            errors.push(...result.value.errors);

            const lawNumText = lawNum.text();
            const lawNameLength = getLawNameLength(lawNumText);

            if (aliasInfo) {
                const { nameSquareParentheses, following, pointerRanges } = aliasInfo;

                const name = nameSquareParentheses.content.text();

                const scope = (
                    pointerRanges
                        ? getScope(
                            container,
                            pointerRanges,
                            following ? {
                                sentenceIndex: sentenceEnv.index,
                                textOffset: sentenceEnv.textRageOfEL(nameSquareParentheses)?.[1] ?? 0,
                            } : undefined,
                        )
                        : [
                            {
                                start: {
                                    sentenceIndex: sentenceEnv.index,
                                    textOffset: sentenceEnv.textRageOfEL(lawNum)?.[1] ?? 0,
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
                    type: "LawName",
                    name,
                    value: lawNumText,
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

            } else {
                const name = lawNameCandidate.text().slice(-lawNameLength);

                const scope = [
                    {
                        start: {
                            sentenceIndex: sentenceEnv.index,
                            textOffset: sentenceEnv.textRageOfEL(lawNum)?.[1] ?? 0,
                        },
                        end: {
                            sentenceIndex: (sentenceEnv.container.thisOrClosest(p => p.type === ContainerType.TOPLEVEL || p.type === ContainerType.ROOT)?.sentenceRange[1] ?? Number.NaN) + 1,
                            textOffset: 0,
                        },
                    },
                ];

                const lawNameCandidateTextRange = sentenceEnv.textRageOfEL(lawNameCandidate);
                if (!lawNameCandidateTextRange) {
                    throw new Error("lawNameCandidateTextRange is null");
                }

                const nameSentenceTextRange: SentenceTextRange = {
                    start: {
                        sentenceIndex: sentenceEnv.index,
                        textOffset: lawNameCandidateTextRange[1] - lawNameLength,
                    },
                    end: {
                        sentenceIndex: sentenceEnv.index,
                        textOffset: lawNameCandidateTextRange[1],
                    },
                };

                const declarationID = `decl-sentence_${sentenceEnv.index}-text_${lawNameCandidateTextRange[1] - lawNameLength}_${lawNameCandidateTextRange[1]}`;

                const declaration = new ____Declaration({
                    declarationID,
                    type: "LawName",
                    name,
                    value: lawNumText,
                    scope: scope,
                    nameSentenceTextRange,
                    range: lawNameCandidate.range && [
                        lawNameCandidate.range[1] - lawNameLength,
                        lawNameCandidate.range[1],
                    ],
                });

                elToBeModified.children.splice(
                    i,
                    1,
                    new __Text(
                        lawNameCandidate.text().slice(0, lawNameCandidate.text().length - lawNameLength),
                        lawNameCandidate.range && [
                            lawNameCandidate.range[0],
                            lawNameCandidate.range[0] + lawNameLength,
                        ],
                    ),
                    declaration,
                );
                i++;

                return {
                    value: { declaration },
                    errors,
                };

            }
        }
    }
    return null;
};
