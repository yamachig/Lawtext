// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sha512 from "hash.js/lib/hash/sha/512";
import { LAWNUM_TABLE, KEY_LENGTH } from "../../law/lawNumTable";
import { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { __Text, ____Declaration, ____LawRef, ____PointerRanges } from "../../node/el/controls";
import { ContainerType } from "../../node/container";
import $lawRef from "../sentenceChildrenParser/rules/$lawRef";
import { initialEnv } from "../sentenceChildrenParser/env";
import { SentenceChildEL } from "../../node/cst/inline";
import { toSentenceTextRanges, SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";
import * as std from "../../law/std";
import { SentenceEnvsStruct } from "../getSentenceEnvs";
import getScope from "../pointerEnvs/getScope";
import { PointerEnvsStruct } from "../pointerEnvs/getPointerEnvs";
import { lawNumLikeToLawNum } from "../../law/lawNum";

export const getLawNameLength = (lawNum: string): number | null => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const digest = sha512().update(lawNum).digest("hex") as string;
    const key = parseInt(digest.slice(0, KEY_LENGTH), 16);
    return LAWNUM_TABLE[key] ?? null;
};

export const processLawRef = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    sentenceEnvsStruct: SentenceEnvsStruct,
    pointerEnvsStruct: PointerEnvsStruct,
): (
    WithErrorValue<{
        declarations: ____Declaration[],
        lawRefs: ____LawRef[],
    }>
) => {
    const errors: ErrorMessage[] = [];
    const declarations: ____Declaration[] = [];
    const lawRefs: ____LawRef[] = [];

    for (let i = 0; i < elToBeModified.children.length; i++) {
        const result = $lawRef.match(
            i,
            (elToBeModified.children as SentenceChildEL[]),
            initialEnv({ target: "" }),
        );

        if (result.ok) {
            const { lawNameCandidates, lawRefInfo: { aliasInfo, lawNum } } = result.value.value;
            errors.push(...result.value.errors);

            const lawNumText = lawNum.text();

            if (aliasInfo) {
                const { nameSquareParentheses, following, pointerRanges } = aliasInfo;

                if (pointerRanges) getScope(pointerRanges, pointerEnvsStruct);

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
                    type: "LawName",
                    name,
                    value: lawNumText,
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

                const lawRef = new ____LawRef({
                    includingDeclarationID: declarationID,
                    range: result.value.value.lawRefInfo.lawRefParentheses.range,
                });
                lawRefs.push(lawRef);
                lawRef.children.push(result.value.value.lawRefInfo.lawRefParentheses);
                const replacingIndex = (elToBeModified.children as (typeof elToBeModified.children)[number][]).indexOf(result.value.value.lawRefInfo.lawRefParentheses);
                elToBeModified.children.splice(
                    replacingIndex,
                    1,
                    lawRef,
                );

                const pointerRangesIndex = replacingIndex + 1;

                if (
                    (pointerRangesIndex < elToBeModified.children.length)
                    && (elToBeModified.children[pointerRangesIndex] instanceof ____PointerRanges)
                )
                {
                    const pointerRanges = elToBeModified.children[pointerRangesIndex] as ____PointerRanges;
                    const firstPointer = pointerRanges.ranges()[0].pointers()[0];
                    const pointerEnv = pointerEnvsStruct.pointerEnvByEL.get(firstPointer);
                    if (pointerEnv) {
                        pointerEnv.directLawNum = lawNumLikeToLawNum(lawNumText);
                    }
                }

            } else {
                const lawNameLength = getLawNameLength(lawNumLikeToLawNum(lawNumText));

                const lawNameCandidateTexts = lawNameCandidates.map(c => {
                    if (std.isRuby(c)) {
                        return c.children.filter(cc => !std.isRt(cc)).map(cc => typeof cc === "string" ? cc : cc.text()).join("");
                    } else {
                        return c.text();
                    }
                });

                if (lawNameLength !== null) {

                    let lawNameCandidateStartIndex = lawNameCandidateTexts.length - 1;
                    let candidateStartTextRangeStart = (lawNameCandidates && sentenceEnv.textRageOfEL(lawNameCandidates[0])?.[0]) ?? 0;
                    let candidateStartRestLength = 0;
                    for (let i = lawNameCandidateTexts.length - 1; 0 <= i; i--) {
                        const candidateLength = lawNameCandidateTexts.slice(i).reduce(((a, b) => a + b.length), 0);
                        if (candidateLength >= lawNameLength) {
                            const c = lawNameCandidates[i];
                            const range = sentenceEnv.textRageOfEL(c);
                            lawNameCandidateStartIndex = i;
                            if (std.isRuby(c)) {
                                if (range) candidateStartTextRangeStart = range[0];
                                candidateStartRestLength = 0;
                            } else if (range) {
                                candidateStartTextRangeStart = range[0] + (candidateLength - lawNameLength);
                                candidateStartRestLength = candidateLength - lawNameLength;
                            }
                            break;
                        }
                    }

                    const name = lawNameCandidateTexts.slice(lawNameCandidateStartIndex).join("").slice(-lawNameLength);

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

                    const lawNameStartEL = lawNameCandidates[lawNameCandidateStartIndex];
                    const lawNameCandidateTextStartRange = sentenceEnv.textRageOfEL(lawNameStartEL);
                    const lawNameCandidateTextEndRange = sentenceEnv.textRageOfEL(lawNameCandidates[lawNameCandidates.length - 1]);
                    const lawNameCandidateTextRange = lawNameCandidateTextStartRange && lawNameCandidateTextEndRange && [lawNameCandidateTextStartRange[0], lawNameCandidateTextEndRange[1]];
                    if (!lawNameCandidateTextRange) {
                        errors.push(new ErrorMessage(
                            "lawNameCandidateTextRange is null",
                            [
                                sentenceEnv.textRageOfEL(lawNameCandidates[0])?.[0] ?? 0,
                                sentenceEnv.textRageOfEL(lawNameCandidates[lawNameCandidates.length - 1])?.[1] ?? 0,
                            ],
                        ));
                        continue;
                    }

                    const nameSentenceTextRange: SentenceTextRange = {
                        start: {
                            sentenceIndex: sentenceEnv.index,
                            textOffset: candidateStartTextRangeStart,
                        },
                        end: {
                            sentenceIndex: sentenceEnv.index,
                            textOffset: lawNameCandidateTextRange[1],
                        },
                    };

                    const declarationID = `decl-sentence_${sentenceEnv.index}-text_${nameSentenceTextRange.start.textOffset}_${nameSentenceTextRange.end.textOffset}`;

                    const declaration = new ____Declaration({
                        declarationID,
                        type: "LawName",
                        name,
                        value: lawNumText,
                        scope: scope,
                        nameSentenceTextRange,
                        children: [
                            ...((std.isRuby(lawNameStartEL) || candidateStartRestLength === 0) ? [lawNameStartEL] : [
                                new __Text(
                                    lawNameStartEL.text().slice(candidateStartRestLength),
                                    lawNameStartEL.range && [
                                        lawNameStartEL.range[0] + candidateStartRestLength,
                                        lawNameStartEL.range[1],
                                    ],
                                ),
                            ]),
                            ...lawNameCandidates.slice(lawNameCandidateStartIndex + 1),
                        ],
                        range: lawNameStartEL.range && [
                            lawNameStartEL.range[0] + candidateStartRestLength,
                            lawNameStartEL.range[1],
                        ],
                    });
                    declarations.push(declaration);

                    const lawRef = new ____LawRef({
                        includingDeclarationID: declarationID,
                        range: declaration.range && result.value.value.lawRefInfo.lawRefParentheses.range ? [
                            declaration.range[0],
                            result.value.value.lawRefInfo.lawRefParentheses.range[1],
                        ] : null,
                    });
                    lawRefs.push(lawRef);
                    lawRef.children.push(declaration);
                    lawRef.children.push(result.value.value.lawRefInfo.lawRefParentheses);

                    const replacedCount = (lawNameCandidates.length - lawNameCandidateStartIndex) + 1;

                    const pointerRangesIndex = i + lawNameCandidateStartIndex + replacedCount;

                    elToBeModified.children.splice(
                        i + lawNameCandidateStartIndex,
                        replacedCount,
                        ...((std.isRuby(lawNameStartEL) || candidateStartRestLength === 0) ? [] : [
                            new __Text(
                                lawNameStartEL.text().slice(0, candidateStartRestLength),
                                lawNameStartEL.range && [
                                    lawNameStartEL.range[0],
                                    lawNameStartEL.range[0] + candidateStartRestLength,
                                ],
                            ),
                        ]),
                        lawRef,
                    );
                    i += (replacedCount - 1);

                    if (
                        (pointerRangesIndex < elToBeModified.children.length)
                        && (elToBeModified.children[pointerRangesIndex] instanceof ____PointerRanges)
                    )
                    {
                        const pointerRanges = elToBeModified.children[pointerRangesIndex] as ____PointerRanges;
                        const firstPointer = pointerRanges.ranges()[0].pointers()[0];
                        const pointerEnv = pointerEnvsStruct.pointerEnvByEL.get(firstPointer);
                        if (pointerEnv) {
                            pointerEnv.directLawNum = lawNumLikeToLawNum(lawNumText);
                        }
                    }
                }

            }
        }
    }

    return {
        value: { declarations, lawRefs },
        errors,
    };
};
