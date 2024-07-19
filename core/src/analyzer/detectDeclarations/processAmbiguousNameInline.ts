import type { WithErrorValue } from "../../parser/std/util";
import { ErrorMessage } from "../../parser/cst/error";
import type { ____PointerRanges } from "../../node/el/controls";
import { __Parentheses, __Text, ____Declaration } from "../../node/el/controls";
import { initialEnv } from "../sentenceChildrenParser/env";
import type { SentenceChildEL } from "../../node/cst/inline";
import type { SentenceEnv, SentenceTextRange } from "../../node/container/sentenceEnv";
import { toSentenceTextRanges } from "../../node/container/sentenceEnv";
import type * as std from "../../law/std";
import type { SentenceEnvsStruct } from "../getSentenceEnvs";
import type { Declarations } from "../common/declarations";
import $ambiguousNameParenthesesContent from "../sentenceChildrenParser/rules/$ambiguousNameParenthesesContent";
import getScope from "../pointerEnvs/getScope";
import type { PointerEnvsStruct } from "../pointerEnvs/getPointerEnvs";

// Characters other than Hiragana's, spaces, and punctuations.
const ptnNameChar = "(?!(?:\\s|[。、]))[^ぁ-ゟ]";

// match[0] possibly includes "当該"
// match[1] possibly includes "の"
// match[2] does not include "の"
const reNameGrp1 = new RegExp(`(?:当該)?((?:(?:${ptnNameChar})+の(?!当該))?((?:${ptnNameChar})+))$`);

interface AmbiguousNameCandidateInfo {
    elToBeModified: std.StdEL | std.__EL,
    nameCandidateEL: __Text,
    afterNameParentheses: __Parentheses,
    following: boolean,
    pointerRanges: ____PointerRanges | null,
    valueELs: SentenceChildEL[],
    sentenceEnv: SentenceEnv,
}

export const findAmbiguousNameCandidateInfos = (
    elToBeModified: std.StdEL | std.__EL,
    sentenceEnv: SentenceEnv,
    pointerEnvsStruct: PointerEnvsStruct,
): (
    WithErrorValue<AmbiguousNameCandidateInfo[]>
) => {
    const errors: ErrorMessage[] = [];
    const ambiguousNameCandidateInfos: AmbiguousNameCandidateInfo[] = [];

    for (let i = 1; i < elToBeModified.children.length; i++) {
        // Leave the first child for nameCandidateEL.

        const nameCandidateEL = elToBeModified.children[i - 1];
        if (!(nameCandidateEL instanceof __Text)) continue;

        const parentheses = elToBeModified.children[i];
        if (!(parentheses instanceof __Parentheses && parentheses.attr.type === "round")) continue;
        const pContent = parentheses.content;

        const result = $ambiguousNameParenthesesContent.match(
            0,
            (pContent.children as SentenceChildEL[]),
            initialEnv({ target: "" }),
        );
        if (!result.ok) continue;

        const { following, pointerRanges, valueELs } = result.value.value;

        if (pointerRanges) getScope(pointerRanges, pointerEnvsStruct);

        ambiguousNameCandidateInfos.push({
            elToBeModified,
            nameCandidateEL,
            following,
            pointerRanges,
            valueELs,
            afterNameParentheses: parentheses,
            sentenceEnv,
        });
        errors.push(...result.value.errors);
    }

    for (const child of elToBeModified.children) {
        if (typeof child === "string") continue;
        const result = findAmbiguousNameCandidateInfos(child as std.StdEL | std.__EL, sentenceEnv, pointerEnvsStruct);
        ambiguousNameCandidateInfos.push(...result.value);
        errors.push(...result.errors);
    }

    return {
        value: ambiguousNameCandidateInfos,
        errors,
    };
};

interface NameInfo extends AmbiguousNameCandidateInfo {
    nameCandidates: Set<string>,
    scope: SentenceTextRange[],
    errorEmitted: boolean,
    maxCandidateLength: number,
}

interface FilteredNameInfo extends AmbiguousNameCandidateInfo {
    name: string,
    scope: SentenceTextRange[],
}

export const findFilteredAmbiguousNameInline = (
    sentenceEnvsStruct: SentenceEnvsStruct,
    allDeclarations: Declarations,
    pointerEnvsStruct: PointerEnvsStruct,
): (
    WithErrorValue<FilteredNameInfo[]>
) => {
    const errors: ErrorMessage[] = [];
    const nameInfos: NameInfo[] = [];

    for (const sentenceEnv of sentenceEnvsStruct.sentenceEnvs) {
        const result = findAmbiguousNameCandidateInfos(sentenceEnv.el, sentenceEnv, pointerEnvsStruct);
        errors.push(...result.errors);

        if (result.value.length === 0) continue;

        for (const info of result.value) {
            const followingStartPos = info.following ? {
                sentenceIndex: sentenceEnv.index,
                textOffset: sentenceEnv.textRageOfEL(info.valueELs[info.valueELs.length - 1])?.[1] ?? 0,
            } : null;

            const scope = toSentenceTextRanges(
                info.pointerRanges?.targetContainerIDRanges ?? null,
                sentenceEnvsStruct,
                followingStartPos,
            );

            nameInfos.push({
                ...info,
                scope,
                nameCandidates: new Set(),
                errorEmitted: false,
                maxCandidateLength: 0,
            });
        }
    }

    if (nameInfos.length === 0) return { value: [], errors };

    const nameRegistry = new Map<string, Set<NameInfo>>();

    for (const info of nameInfos) {

        // "Word-likeness" (part 1): Pick keywords consisting of Kanji's or Katakana's excluding "当該", connected by at most one "の"
        // e.g. "（略）行政運営における公正の確保と透明性" -> ["透明性"]
        // e.g. "（略）命令等を定めようとする場合には、当該命令等の案" -> ["案", "命令等の案"]
        // e.g. "中期目標の期間" -> ["期間", "中期目標の期間"]
        // e.g. "（略）その担任する事務に関する国の不作為" -> ["不作為", "国の不作為"]
        // e.g. "（略）その担任する事務に関する都道府県の不作為" -> ["不作為", "都道府県の不作為"]

        const match = reNameGrp1.exec(info.nameCandidateEL.text());
        if (!match) {
            if (!info.errorEmitted) errors.push(new ErrorMessage(
                "processAmbiguousNameInline: 定義語のような文字列が見つかりませんでした。",
                info.nameCandidateEL.range ? [
                    info.nameCandidateEL.range[1],
                    info.nameCandidateEL.range[1],
                ] : [NaN, NaN],
            ));
            info.errorEmitted = true;
            continue;
        }
        info.nameCandidates.add(match[1]); // possibly includes "の"
        info.nameCandidates.add(match[2]); // without "の"
        info.maxCandidateLength = match[1].length;

        const nameCandidateLastOffset = info.sentenceEnv.textRageOfEL(info.nameCandidateEL)?.[1] ?? null;
        const parentheseeLastOffset = info.sentenceEnv.textRageOfEL(info.afterNameParentheses)?.[1] ?? null;

        // "Consistency": Skip candidates occurred outside of the scope.

        for (const sentenceEnv of sentenceEnvsStruct.sentenceEnvs) {
            // TODO: exclude square parentheses, QuoteStruct and NewProvision

            if (info.nameCandidates.size === 0) break;
            for (const name of [...info.nameCandidates]) {
                let nextOffset = 0;
                let inSentenceOffset = -1;
                while ((inSentenceOffset = sentenceEnv.text.indexOf(name, nextOffset)) >= 0){
                    nextOffset = inSentenceOffset + name.length;

                    if (!info.nameCandidates.has(name)) break;

                    if (
                        (nameCandidateLastOffset !== null)
                        && (sentenceEnv.index === info.sentenceEnv.index)
                        && (inSentenceOffset === (nameCandidateLastOffset ?? name.length) - name.length)
                    ) {
                        // at the declaration position
                        continue;
                    }

                    if (
                        ((nameCandidateLastOffset !== null) && (parentheseeLastOffset !== null))
                        && (sentenceEnv.index === info.sentenceEnv.index)
                        && ((nameCandidateLastOffset <= inSentenceOffset) && (inSentenceOffset <= parentheseeLastOffset))
                    ) {
                        // inside the after name position
                        // e.g. "電気通信業務（電気通信事業法（昭和五十九年法律第八十六号）第二条第六号の電気通信業務をいう。以下同じ。）"
                        continue;
                    }

                    {
                        // Check if the match is a part of another word.
                        // TODO: exclude other declared words.
                        {
                            const newWord = sentenceEnv.text.substring(0, inSentenceOffset + name.length);
                            const match = reNameGrp1.exec(newWord);
                            if (match && match[1] !== newWord) continue;
                        }
                        if (inSentenceOffset + name.length < sentenceEnv.text.length) {
                            const newWord = sentenceEnv.text.substring(inSentenceOffset, inSentenceOffset + name.length + 1);
                            const match = reNameGrp1.exec(newWord);
                            if (match && match[1] === newWord) continue;
                        }
                        if (inSentenceOffset + name.length + 1 < sentenceEnv.text.length) {
                            const newWord = sentenceEnv.text.substring(inSentenceOffset, inSentenceOffset + name.length + 2);
                            const match = reNameGrp1.exec(newWord);
                            if (match && match[1] === newWord) continue;
                        }
                    }

                    // check if the occurance is in scope
                    let inScope = false;
                    for (const s of info.scope) {
                        if (
                            (
                                (s.start.sentenceIndex < sentenceEnv.index)
                            || ((s.start.sentenceIndex === sentenceEnv.index) && (s.start.textOffset <= inSentenceOffset))
                            )
                            && (
                                (sentenceEnv.index < s.end.sentenceIndex)
                                || ((sentenceEnv.index === s.end.sentenceIndex) && (inSentenceOffset <= s.end.textOffset))
                            )
                        ) {
                            inScope = true;
                            break;
                        }
                    }
                    if (!inScope) {
                        info.nameCandidates.delete(name);
                        break;
                    }
                }
            }
        }

        if (info.nameCandidates.size === 0) {
            if (!info.errorEmitted) errors.push(new ErrorMessage(
                "processAmbiguousNameInline: この法令中に未定義で使用されている例があるため、定義語としての処理を行いませんでした。",
                info.nameCandidateEL.range ? [
                    info.nameCandidateEL.range[1] - info.maxCandidateLength,
                    info.nameCandidateEL.range[1],
                ] : [NaN, NaN],
            ));
            info.errorEmitted = true;
            continue;
        }

        info.maxCandidateLength = Math.max(...[...info.nameCandidates].map(n => n.length));

        // "Distinctiveness" (part 1): Remove unambiguously declared names.
        // e.g. "以下「案」という。" and ["案", "命令等の案"] -> remove "案"

        const currentDeclarations = allDeclarations.filterByRange({
            start: {
                sentenceIndex: info.sentenceEnv.index,
                textOffset: (nameCandidateLastOffset ?? info.maxCandidateLength) - info.maxCandidateLength,
            },
            end: {
                sentenceIndex: info.sentenceEnv.index,
                textOffset: nameCandidateLastOffset ?? 0,
            },
        }, true);

        for (const declaration of currentDeclarations.values()) {
            if (info.nameCandidates.size === 0) continue;
            if (info.nameCandidates.has(declaration.attr.name)) {
                info.nameCandidates.delete(declaration.attr.name);
            }
        }

        if (info.nameCandidates.size === 0) {
            if (!info.errorEmitted) errors.push(new ErrorMessage(
                "processAmbiguousNameInline: この法令中に同一の語を「～」で定義している例があるため、定義語としての処理を行いませんでした。",
                info.nameCandidateEL.range ? [
                    info.nameCandidateEL.range[1] - info.maxCandidateLength,
                    info.nameCandidateEL.range[1],
                ] : [NaN, NaN],
            ));
            info.errorEmitted = true;
            continue;
        }

        info.maxCandidateLength = Math.max(...[...info.nameCandidates].map(n => n.length));

        for (const name of info.nameCandidates) {
            const nameInfos = nameRegistry.get(name);
            if (nameInfos) {
                nameInfos.add(info);
            } else {
                nameRegistry.set(name, new Set([info]));
            }
        }
    }

    // "Distinctiveness" (part 2): Remove conflicting candidates.
    // e.g. ["不作為", "国の不作為"] and ["不作為", "都道府県の不作為"] -> remove "不作為"

    for (const [name, nameInfos] of nameRegistry) {
        if (nameInfos.size <= 1) continue;
        const array = [...nameInfos];
        const combinations = array.flatMap((info1, i) => array.slice(i + 1).map(info2 => [info1, info2] as const));

        for (const [info1, info2] of combinations) {
            if (!(info1.nameCandidates.has(name) && info2.nameCandidates.has(name))) continue;

            let overlapping = false;
            for (const range1 of info1.scope) {
                if (overlapping) break;
                for (const range2 of info2.scope) {
                    if (overlapping) break;
                    const noOverlap = (
                        (range1.end.sentenceIndex < range2.start.sentenceIndex)
                            || (
                                (range1.end.sentenceIndex === range2.start.sentenceIndex)
                                && (range1.end.textOffset < range2.start.textOffset)
                            )
                            || (range2.end.sentenceIndex < range1.start.sentenceIndex)
                            || (
                                (range2.end.sentenceIndex === range1.start.sentenceIndex)
                                && (range2.end.textOffset < range1.start.textOffset)
                            )
                    );
                    if (!noOverlap) overlapping = true;
                }
            }

            if (overlapping) {
                info1.nameCandidates.delete(name);
                info2.nameCandidates.delete(name);
                nameInfos.delete(info1);
                nameInfos.delete(info2);
            }
        }
    }

    const filteredNameInfos: FilteredNameInfo[] = [];

    for (const info of nameInfos) {

        if (info.nameCandidates.size === 0) {
            if (!info.errorEmitted) errors.push(new ErrorMessage(
                "processAmbiguousNameInline: 同一の語を定義しようとする例があったため、定義語としての処理を行いませんでした。",
                info.nameCandidateEL.range ? [
                    info.nameCandidateEL.range[1] - info.maxCandidateLength,
                    info.nameCandidateEL.range[1],
                ] : [NaN, NaN],
            ));
            info.errorEmitted = true;
            continue;
        }

        // "Word-likeness" (part 2): Pick the shortest candidate, avoiding a candidate with one character if possible.
        let filteredCandidates = [...info.nameCandidates].filter(a => a.length > 1);
        if (filteredCandidates.length === 0) filteredCandidates = [...info.nameCandidates];
        filteredNameInfos.push({
            ...info,
            name: filteredCandidates.sort((a, b) => a.length - b.length)[0],
        });
    }

    return {
        value: filteredNameInfos,
        errors,
    };
};

export const processAmbiguousNameInline = (
    sentenceEnvsStruct: SentenceEnvsStruct,
    allDeclarations: Declarations,
    pointerEnvsStruct: PointerEnvsStruct,
): (
    WithErrorValue<{
        toAddDeclarations: ____Declaration[],
    }>
) => {
    const errors: ErrorMessage[] = [];
    const toAddDeclarations: ____Declaration[] = [];

    const filteredNameInfos = findFilteredAmbiguousNameInline(sentenceEnvsStruct, allDeclarations, pointerEnvsStruct);
    errors.push(...filteredNameInfos.errors);

    if (filteredNameInfos.value.length === 0) {
        return {
            value: { toAddDeclarations },
            errors,
        };
    }

    for (const { scope, pointerRanges, sentenceEnv, name, nameCandidateEL, elToBeModified } of filteredNameInfos.value) {

        if (scope.length === 0) {
            errors.push(new ErrorMessage(
                "No scope found",
                [
                    pointerRanges?.range?.[0] ?? 0,
                    pointerRanges?.range?.[1] ?? 0,
                ],
            ));
        }

        const nameCandidateELTextRange = sentenceEnv.textRageOfEL(nameCandidateEL);
        if (!nameCandidateELTextRange) {
            errors.push(new ErrorMessage(
                "nameCandidateELRange is null",
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
                textOffset: nameCandidateELTextRange[1] - name.length,
            },
            end: {
                sentenceIndex: sentenceEnv.index,
                textOffset: nameCandidateELTextRange[1],
            },
        };

        const newItems: SentenceChildEL[] = [];
        const nameCandidateELText = nameCandidateEL.text();

        if (name.length < nameCandidateELText.length) {
            newItems.push(new __Text(
                nameCandidateELText.slice(0, -name.length),
                nameCandidateEL.range && [nameCandidateEL.range[0], nameCandidateEL.range[1] - name.length],
            ));
        }

        const declarationID = `decl-sentence_${sentenceEnv.index}-text_${nameCandidateELTextRange[1] - name.length}_${nameCandidateELTextRange[1]}`;

        const declaration = new ____Declaration({
            declarationID,
            type: "Keyword",
            name,
            value: null,
            scope: scope,
            nameSentenceTextRange,
            range: nameCandidateEL.range ? [
                nameCandidateEL.range[1] - name.length,
                nameCandidateEL.range[1],
            ] : null,
            children: [name],
        });
        toAddDeclarations.push(declaration);
        newItems.push(declaration);

        elToBeModified.children.splice(
            (elToBeModified.children as (typeof elToBeModified.children)[number][]).indexOf(nameCandidateEL),
            1,
            ...newItems,
        );
    }

    return {
        value: { toAddDeclarations },
        errors,
    };
};
