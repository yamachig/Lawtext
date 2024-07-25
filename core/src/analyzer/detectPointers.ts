import { digitsToKanjiNum } from "../law/num";
import * as std from "../law/std";
import { isSentenceLike } from "../node/container/sentenceEnv";
import type { EL } from "../node/el";
import { __Parentheses } from "../node/el/controls";
import type { AppdxPointer } from "../node/pointerEnv";
import { initialEnv } from "../parser/cst/env";
import type { ErrorMessage } from "../parser/cst/error";
import $sentenceChildren, { makeReOutsideParenthesesTextChars, makeReParenthesesInlineTextChars, makeRePeriodSentenceTextChars } from "../parser/cst/rules/$sentenceChildren";
import type { WithErrorValue } from "../parser/cst/util";
import { $inlineWithPointerRanges, pointerRangesCandidateChars } from "./textParser/rules/$pointerRanges";

export const detectPointersInner = (
    options: {
        elToBeModified: EL,
        appdxPointers: AppdxPointer[],
        stopChars: string,
    },
): ErrorMessage[] => {
    const { elToBeModified, appdxPointers, stopChars } = options;

    const errorMessages: ErrorMessage[] = [];

    if (std.isStdEL(elToBeModified, ["LawTitle", "LawNum", "QuoteStruct", "ArticleTitle", ...std.articleGroupTitleTags, ...std.paragraphItemTitleTags, ...std.appdxItemTitleTags, ...std.supplProvisionAppdxItemTitleTags])) {
        //
    } else if (elToBeModified instanceof __Parentheses && elToBeModified.attr.type === "square") {
        //
    } else if (isSentenceLike(elToBeModified) && elToBeModified.children.length > 0) {
        const target = elToBeModified.innerXML();
        const result = $sentenceChildren.match(0, target, initialEnv({
            options: {
                reParenthesesInlineTextChars: makeReParenthesesInlineTextChars(stopChars),
                reOutsideParenthesesTextChars: makeReOutsideParenthesesTextChars(stopChars),
                rePeriodSentenceTextChars: makeRePeriodSentenceTextChars(stopChars),
                inlineTokenRule: $inlineWithPointerRanges,
                appdxPointers,
            },
            baseOffset: (elToBeModified.children[0] as EL).range?.[0],
        }));
        if (result.ok && result.nextOffset === target.length) {
            elToBeModified.children.splice(0, elToBeModified.children.length, ...result.value.value);
            errorMessages.push(...result.value.errors);
        } else {
            const message = `detectPointersInner: Error: ${elToBeModified.innerXML()}`;
            throw new Error(message);
        }
    } else {
        for (const c of elToBeModified.children) {
            if (typeof c === "string") continue;
            errorMessages.push(...detectPointersInner({ elToBeModified: c, appdxPointers, stopChars }));
        }
    }
    return errorMessages;
};

export const detectPointers = (elToBeModified: EL): WithErrorValue<AppdxPointer[]> => {
    const appdxItems = (
        std.isLaw(elToBeModified)
            ? elToBeModified.children.find(std.isLawBody)?.children.filter(std.isAppdxItem) ?? []
            : std.isLawBody(elToBeModified)
                ? elToBeModified.children.filter(std.isAppdxItem)
                : []
    );
    const supplProvisionAppdxItems = (
        std.isLaw(elToBeModified)
            ? elToBeModified.children.find(std.isLawBody)?.children.find(c => std.isSupplProvision(c) && !c.attr.AmendLawNum)?.children.filter(std.isSupplProvisionAppdxItem) ?? []
            : std.isLawBody(elToBeModified)
                ? elToBeModified.children.find(c => std.isSupplProvision(c) && !c.attr.AmendLawNum)?.children.filter(std.isSupplProvisionAppdxItem) ?? []
                : std.isSupplProvision(elToBeModified) && !elToBeModified.attr.AmendLawNum
                    ? elToBeModified.children.filter(std.isSupplProvisionAppdxItem)
                    : []
    );

    const appdxPointers: AppdxPointer[] = [];

    const stopChars = new Set(pointerRangesCandidateChars);

    for (const el of [...appdxItems, ...supplProvisionAppdxItems]){
        const origName = el.children.find(c => std.isAppdxItemTitle(c) || std.isSupplProvisionAppdxItemTitle(c))?.text();
        if (!origName) continue;

        const digitsName = origName
            ?.replace(/(?<=[^(（])(?:[(（](?![0123456789０１２３４５６７８９〇一二三四五六七八九十百千]+[)）])[^)）]+[)）])+$/g, "")
            .split(/\s+/g)[0]
            .replace(/^[(（]([^)）]+)[)）]$/, m => m[1]);
        appdxPointers.push({
            pointerText: digitsName,
            el,
        });
        stopChars.add(digitsName[0]);

        const kanjiNumName = digitsName
            ?.replace(/[0123456789０１２３４５６７８９]+/g, digitsToKanjiNum);
        if (digitsName !== kanjiNumName) {
            appdxPointers.push({
                pointerText: kanjiNumName,
                el,
            });
            stopChars.add(kanjiNumName[0]);
        }
        appdxPointers.sort((a, b) => b.pointerText.length - a.pointerText.length);
    }

    const errors = detectPointersInner({ elToBeModified, appdxPointers, stopChars: [...stopChars].join("") });

    return { value: appdxPointers, errors };
};

export default detectPointers;
