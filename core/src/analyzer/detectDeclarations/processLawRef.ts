// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sha512 from "hash.js/lib/hash/sha/512";
import { LAWNUM_TABLE, KEY_LENGTH } from "../../law/lawNumTable";
import type { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import { __Text, ____Declaration, ____LawNum, ____LawRef, ____PointerRanges } from "../../node/el/controls";
import { ContainerType } from "../../node/container";
import $lawRef from "../sentenceChildrenParser/rules/$lawRef";
import { initialEnv } from "../sentenceChildrenParser/env";
import type { SentenceChildEL } from "../../node/cst/inline";
import type { SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";
import { toSentenceTextRanges } from "../../node/container/sentenceEnv";
import * as std from "../../law/std";
import type { SentenceEnvsStruct } from "../getSentenceEnvs";
import getScope from "../pointerEnvs/getScope";
import type { PointerEnvsStruct } from "../pointerEnvs/getPointerEnvs";
import { lawNumLikeToLawNum } from "../../law/lawNum";
import type { ValueOfRule } from "generic-parser";

export const getLawTitleLength = (lawNum: string): number | null => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const digest = sha512().update(lawNum).digest("hex") as string;
    const key = parseInt(digest.slice(0, KEY_LENGTH), 16);
    return LAWNUM_TABLE[key] ?? null;
};

const getSuggestedLawTitleInfo = (options: {
    sentenceEnv: SentenceEnv,
    lawRefResult: ValueOfRule<typeof $lawRef>["value"],
}) => {
    const errors: ErrorMessage[] = [];

    const { lawRefResult, sentenceEnv } = options;
    const { lawTitleCandidates, lawRefInfo: { lawNum } } = lawRefResult;
    const lawTitleLength = getLawTitleLength(lawNumLikeToLawNum(lawNum.text()));

    if (!lawTitleLength) {
        errors.push(new ErrorMessage(
            "Could not find lawTitleLength",
            sentenceEnv.textRageOfEL(lawNum) ?? [0, 0],
        ));
        return { errors };
    }

    const lawTitleCandidateTexts = lawTitleCandidates.map(c => {
        if (std.isRuby(c)) {
            return c.children.filter(cc => !std.isRt(cc)).map(cc => typeof cc === "string" ? cc : cc.text()).join("");
        } else {
            return c.text();
        }
    });

    let candidateStartTextRangeStart = (lawTitleCandidates && sentenceEnv.textRageOfEL(lawTitleCandidates[0])?.[0]) ?? 0;
    let candidateStartRestLength = 0;

    let lawTitleCandidatestartIndex = lawTitleCandidateTexts.length - 1;

    for (let i = lawTitleCandidateTexts.length - 1; 0 <= i; i--) {
        const candidateLength = lawTitleCandidateTexts.slice(i).reduce(((a, b) => a + b.length), 0);
        if (candidateLength >= lawTitleLength) {
            const c = lawTitleCandidates[i];
            const range = sentenceEnv.textRageOfEL(c);
            lawTitleCandidatestartIndex = i;
            if (std.isRuby(c)) {
                if (range) candidateStartTextRangeStart = range[0];
                candidateStartRestLength = 0;
            } else if (range) {
                candidateStartTextRangeStart = range[0] + (candidateLength - lawTitleLength);
                candidateStartRestLength = candidateLength - lawTitleLength;
            }
            break;
        }
    }

    const lawTitleStartEL = lawTitleCandidates[lawTitleCandidatestartIndex];
    const lawTitleCandidateTextStartRange = sentenceEnv.textRageOfEL(lawTitleStartEL);
    const lawTitleCandidateTextEndRange = sentenceEnv.textRageOfEL(lawTitleCandidates[lawTitleCandidates.length - 1]);
    const lawTitleCandidateTextRange = lawTitleCandidateTextStartRange && lawTitleCandidateTextEndRange && [lawTitleCandidateTextStartRange[0], lawTitleCandidateTextEndRange[1]];
    if (!lawTitleCandidateTextRange) {
        errors.push(new ErrorMessage(
            "lawTitleCandidateTextRange is null",
            [
                sentenceEnv.textRageOfEL(lawTitleCandidates[0])?.[0] ?? 0,
                sentenceEnv.textRageOfEL(lawTitleCandidates[lawTitleCandidates.length - 1])?.[1] ?? 0,
            ],
        ));
        return { errors };
    }

    const suggestedLawTitle = lawTitleCandidateTexts.slice(lawTitleCandidatestartIndex).join("").slice(-lawTitleLength);

    const replacer = {
        children: [
            ...((std.isRuby(lawTitleStartEL) || candidateStartRestLength === 0) ? [lawTitleStartEL] : [
                new __Text(
                    lawTitleStartEL.text().slice(candidateStartRestLength),
                    lawTitleStartEL.range && [
                        lawTitleStartEL.range[0] + candidateStartRestLength,
                        lawTitleStartEL.range[1],
                    ],
                ),
            ]),
            ...lawTitleCandidates.slice(lawTitleCandidatestartIndex + 1),
        ],
        range: lawTitleStartEL.range && [
            lawTitleStartEL.range[0] + candidateStartRestLength,
            lawTitleCandidates[lawTitleCandidates.length - 1].range?.[1] ?? 0,
        ] as [number, number],
        restText: (std.isRuby(lawTitleStartEL) || candidateStartRestLength === 0) ? null : (
            new __Text(
                lawTitleStartEL.text().slice(0, candidateStartRestLength),
                lawTitleStartEL.range && [
                    lawTitleStartEL.range[0],
                    lawTitleStartEL.range[0] + candidateStartRestLength,
                ],
            )
        ),
        replacedCount: lawTitleCandidates.length - lawTitleCandidatestartIndex,
    };

    return {
        value: {
            suggestedLawTitle,
            candidateStartTextRangeStart,
            candidateStartRestLength,
            lawTitleStartEL,
            lawTitleCandidatestartIndex,
            lawTitleCandidateTextRange,
            replacer,
        },
        errors,
    };
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

        if (
            (0 <= i - 1)
            && (i < elToBeModified.children.length)
            && (elToBeModified.children[i - 1] instanceof ____LawRef)
            && (elToBeModified.children[i] instanceof ____PointerRanges)
        ) {
            // process prependedLawRef for e.g. "国家行政組織法（昭和二十三年法律第百二十号）第三条第二項"
            const lawRef = elToBeModified.children[i - 1] as ____LawRef;
            const pointerRanges = elToBeModified.children[i] as ____PointerRanges;
            const firstPointer = pointerRanges.ranges()[0].pointers()[0];
            const pointerEnv = pointerEnvsStruct.pointerEnvByEL.get(firstPointer);
            if (pointerEnv) {
                pointerEnv.prependedLawRef = lawRef;
            }

        }

        if (elToBeModified.children[i] instanceof ____LawNum) {
            // e.g. "...日本国憲法..."
            //      -> lawRef is for "日本国憲法"

            const lawNum = elToBeModified.children[i] as ____LawNum;
            const lawNumLikeText = lawNum.text();
            const lawNumText = lawNumLikeToLawNum(lawNumLikeText);

            const lawRef = new ____LawRef({
                range: lawNum.range,
                lawNum: lawNumLikeToLawNum(lawNum.text()),
                ...(
                    (lawNumLikeText !== lawNumText)
                        ? {
                            suggestedLawTitle: lawNumLikeText,
                        }
                        : {}
                ),
            });
            lawRefs.push(lawRef);

            lawRef.children.push(lawNum);

            elToBeModified.children.splice(
                i,
                1,
                lawRef,
            );
            continue;
        }

        const result = $lawRef.match(
            i,
            (elToBeModified.children as SentenceChildEL[]),
            initialEnv({ target: "" }),
        );
        if (!result.ok) continue;

        errors.push(...result.value.errors);

        const lawRefResult = result.value.value;
        const { lawRefInfo: { aliasInfo, lawNum } } = lawRefResult;

        const lawNumText = lawNum.text();
        const SuggestedLawTitleInfo = getSuggestedLawTitleInfo({
            lawRefResult,
            sentenceEnv,
        });
        errors.push(...SuggestedLawTitleInfo.errors);

        // e.g. "...電気通信事業法（昭和五十九年法律第八十六号。以下「法」という。）..."
        //      -> lawRef is for "電気通信事業法（昭和五十九年法律第八十六号。以下「法」という。）"
        // e.g. "...独立行政法人通則法の一部を改正する法律（平成二十六年法律第六十六号。以下「通則法改正法」という。）..."
        //      -> if the length of LawTitle could not be found, lawRef is for "（平成二十六年法律第六十六号。以下「通則法改正法」という。）"

        const lawRef = new ____LawRef({
            range: (
                (SuggestedLawTitleInfo.value)
                    ? [
                        SuggestedLawTitleInfo.value.replacer.range?.[0] ?? 0,
                        lawRefResult.lawRefInfo.lawRefParentheses.range?.[1] ?? 0,
                    ]
                    : lawRefResult.lawRefInfo.lawRefParentheses.range
            ),
            lawNum: lawNumText,
            ...(
                SuggestedLawTitleInfo.value?.suggestedLawTitle
                    ? {
                        suggestedLawTitle: SuggestedLawTitleInfo.value.suggestedLawTitle,
                    }
                    : {}
            ),
        });
        lawRefs.push(lawRef);

        if (aliasInfo) {
            // e.g. "...電気通信事業法（昭和五十九年法律第八十六号。以下「法」という。）..."
            //      -> declaration is for "法"

            const { nameSquareParentheses, following, pointerRanges } = aliasInfo;

            if (pointerRanges) getScope(pointerRanges, pointerEnvsStruct);

            const aliasName = nameSquareParentheses.content.text();

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

            const aliasNameTextRange = sentenceEnv.textRageOfEL(nameSquareParentheses.content);
            if (!aliasNameTextRange) {
                errors.push(new ErrorMessage(
                    "aliasNameTextRange is null",
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
                    textOffset: aliasNameTextRange[0],
                },
                end: {
                    sentenceIndex: sentenceEnv.index,
                    textOffset: aliasNameTextRange[1],
                },
            };

            const declarationID = `decl-sentence_${sentenceEnv.index}-text_${aliasNameTextRange[0]}_${aliasNameTextRange[1]}`;

            const declaration = new ____Declaration({
                declarationID,
                type: "LawTitle",
                name: aliasName,
                value: lawNumText,
                scope: scope,
                nameSentenceTextRange,
                range: nameSquareParentheses.content.range,
                children: [aliasName],
            });
            declarations.push(declaration);

            lawRef.attr.includingDeclarationID = declarationID;

            nameSquareParentheses.content.children.splice(
                0,
                nameSquareParentheses.content.children.length,
                declaration,
            );

            lawRef.children.push(...[
                ...(SuggestedLawTitleInfo.value?.replacer.children ?? []),
                lawRefResult.lawRefInfo.lawRefParentheses,
            ]);

        } else {
            // e.g. "...電気通信事業法（昭和五十九年法律第八十六号）..."
            //      -> aliasInfo does not exist. declaration is for "電気通信事業法".
            // e.g. "...独立行政法人通則法の一部を改正する法律（平成二十六年法律第六十六号）..."
            //      -> if the length of LawTitle could not be found, declaration is not generated.

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

            if (SuggestedLawTitleInfo.value) {
                const {
                    suggestedLawTitle,
                    candidateStartTextRangeStart,
                    lawTitleCandidateTextRange,
                    replacer,
                } = SuggestedLawTitleInfo.value;

                const nameSentenceTextRange: SentenceTextRange = {
                    start: {
                        sentenceIndex: sentenceEnv.index,
                        textOffset: candidateStartTextRangeStart,
                    },
                    end: {
                        sentenceIndex: sentenceEnv.index,
                        textOffset: lawTitleCandidateTextRange[1],
                    },
                };

                const declarationID = `decl-sentence_${sentenceEnv.index}-text_${nameSentenceTextRange.start.textOffset}_${nameSentenceTextRange.end.textOffset}`;

                const declaration = new ____Declaration({
                    declarationID,
                    type: "LawTitle",
                    name: suggestedLawTitle,
                    value: lawNumText,
                    scope: scope,
                    nameSentenceTextRange,
                    children: replacer.children,
                    range: replacer.range,
                });

                declarations.push(declaration);

                lawRef.attr.includingDeclarationID = declarationID;

                lawRef.children.push(declaration);
            }

            lawRef.children.push(lawRefResult.lawRefInfo.lawRefParentheses);

        }

        if (SuggestedLawTitleInfo.value) {
            const {
                lawTitleCandidatestartIndex,
                replacer,
            } = SuggestedLawTitleInfo.value;

            elToBeModified.children.splice(
                i + lawTitleCandidatestartIndex,
                replacer.replacedCount + 1,
                ...(
                    replacer.restText
                        ? [replacer.restText]
                        : []
                ),
                lawRef,
            );
            i += replacer.replacedCount - 1;
        } else {
            const replacingIndex = (elToBeModified.children as (typeof elToBeModified.children)[number][]).indexOf(result.value.value.lawRefInfo.lawRefParentheses);

            elToBeModified.children.splice(
                replacingIndex,
                1,
                lawRef,
            );
        }
    }

    return {
        value: { declarations, lawRefs },
        errors,
    };
};
