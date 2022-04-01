import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, isSingleParentheses, WithErrorRule } from "../util";
import * as std from "../../../law/std";
import { VirtualLine, VirtualOnlyLineType } from "../virtualLine";
import { isAppdxItem, isEnactStatement, isLawBody, isLawNum, isLawTitle, isMainProvision, isPreamble, isSupplProvision, isTOC, newStdEL } from "../../../law/std";
import { Sentences } from "../../../node/cst/inline";
import CST from "../toCSTSettings";
import { assertNever } from "../../../util";
import $toc, { tocToLines } from "./$toc";
import $preamble, { preambleToLines } from "./$preamble";
import $mainProvision, { mainProvisionToLines } from "./$mainProvision";
import $supplProvision, { supplProvisionToLines } from "./$supplProvision";
import { $appdx, $appdxFig, $appdxFormat, $appdxNote, $appdxStyle, $appdxTable, appdxItemToLines } from "./$appdxItem";
import { ErrorMessage } from "../../cst/error";
import { rangeOfELs } from "../../../node/el";
import { sentencesArrayToString } from "../../cst/rules/$sentencesArray";


export const lawToLines = (law: std.Law, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const lawNum = law.children.find(isLawNum);
    const lawBody = law.children.find(isLawBody);
    const lawTitle = lawBody?.children.find(isLawTitle);

    if (lawTitle) {
        lines.push(new OtherLine(
            null,
            indentTexts.length,
            indentTexts,
            [],
            [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, lawTitle.children)]
                )
            ],
            CST.EOL,
        ));
    }

    if (lawNum) {
        lines.push(new OtherLine(
            null,
            indentTexts.length,
            indentTexts,
            [],
            [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, ["（", ...lawNum.children, "）"])]
                )
            ],
            CST.EOL,
        ));
    }

    for (const child of law.children) {
        if (isLawNum(child) || isLawBody(child)) {
            continue;
        }
        else { assertNever(child); }
    }

    for (const child of lawBody?.children || []) {
        if (isLawTitle(child)) {
            continue;
        } else if (isEnactStatement(child)) {
            lines.push(new OtherLine(
                null,
                indentTexts.length,
                indentTexts,
                [],
                [
                    new Sentences(
                        "",
                        null,
                        [],
                        [newStdEL("Sentence", {}, child.children)]
                    )
                ],
                CST.EOL,
            ));
        } else if (isTOC(child)) {
            lines.push(...tocToLines(child, indentTexts));
        } else if (isPreamble(child)) {
            lines.push(...preambleToLines(child, indentTexts));
        } else if (isMainProvision(child)) {
            lines.push(...mainProvisionToLines(child, indentTexts));
        } else if (isSupplProvision(child)) {
            lines.push(...supplProvisionToLines(child, indentTexts));
        } else if (isAppdxItem(child)) {
            lines.push(...appdxItemToLines(child, indentTexts));
        }
        else { assertNever(child); }
    }

    return lines;
};

export const $lawTitleLines: WithErrorRule<{
    lawNameLine: VirtualLine & {
        type: LineType.OTH | VirtualOnlyLineType.CAP;
    };
    lawNumLine: VirtualLine & {
        type: LineType.OTH | VirtualOnlyLineType.CAP;
    } | null;
}> = factory
    .withName("lawTitleLines")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.type === LineType.OTH
                    && item.virtualIndentDepth === 0
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "lawNameLine")
        .and(r => r
            .zeroOrOne(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.OTH
                        && item.line.type === LineType.OTH
                        && item.virtualIndentDepth === 0
                        && isSingleParentheses(item)
                    ) {
                        return item;
                    } else {
                        return null;
                    }
                })
            )
        , "lawNumLine")
        .action(({ lawNameLine, lawNumLine }) => {
            return {
                value: { lawNameLine, lawNumLine },
                errors: [],
            };
        })
    )
    ;


export const $law: WithErrorRule<std.Law> = factory
    .withName("Law")
    .sequence(s => s
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(() => $lawTitleLines)
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                )
            )
        , "lawTitleLines")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (
                                item.type === LineType.OTH
                            ) {
                                return item;
                            } else {
                                return null;
                            }
                        })
                    )
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                )
            )
        , "enactStatementLines")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(() => $toc)
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                )
            )
        , "toc")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .and(() => $preamble)
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                )
            )
        , "preambles")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .and(() => $mainProvision)
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                    .and(r => r
                        .zeroOrMore(r => r
                            .sequence(s => s
                                .andOmit(r => r.nextIsNot(r => r.oneMatch(({ item }) => item.type === LineType.SPR || item.type === LineType.APP ? item : null)))
                                .and(r => r.anyOne())
                                .andOmit(r => r.zeroOrMore(() => $blankLine))
                            )
                        )
                    )
                )
            )
        , "mainProvisionAndErrors")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .and(r => r
                        .choice(c => c
                            .or(() => $supplProvision)
                            .or(() => $appdxFig)
                            .or(() => $appdxTable)
                            .or(() => $appdxStyle)
                            .or(() => $appdxNote)
                            .or(() => $appdxFormat)
                            .or(() => $appdx)
                        )
                    )
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                    .and(r => r
                        .zeroOrMore(r => r
                            .sequence(s => s
                                .andOmit(r => r.nextIsNot(r => r.oneMatch(({ item }) => item.type === LineType.SPR || item.type === LineType.APP ? item : null)))
                                .and(r => r.anyOne())
                                .andOmit(r => r.zeroOrMore(() => $blankLine))
                            )
                        )
                    )
                )
            )
        , "supplOrAppdxItemAndErrors")
        .and(r => r
            .zeroOrMore(r => r
                .sequence(s => s
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                    .and(r => r.anyOne())
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                )
            )
        , "notCapturedErrorLines")
        .action(({ lawTitleLines, enactStatementLines, toc, preambles, mainProvisionAndErrors, supplOrAppdxItemAndErrors, notCapturedErrorLines }) => {
            const errors: ErrorMessage[] = [];

            const law = newStdEL("Law");
            if (lawTitleLines?.value.lawNumLine) {
                const parentheses = isSingleParentheses(lawTitleLines.value.lawNumLine);
                console.log(parentheses);
                law.append(newStdEL(
                    "LawNum",
                    {},
                    [
                        parentheses
                            ? parentheses.content
                            : sentencesArrayToString(lawTitleLines.value.lawNumLine.line.sentencesArray)
                    ],
                    lawTitleLines.value.lawNumLine.virtualRange,
                ));
            }

            const lawBody = newStdEL("LawBody");
            law.append(lawBody);

            if (lawTitleLines) {
                lawBody.append(newStdEL(
                    "LawTitle",
                    {},
                    lawTitleLines.value.lawNameLine.line.sentencesArray.flat().map(ss => ss.sentences).flat().map(s => s.children).flat(),
                    lawTitleLines.value.lawNameLine.virtualRange,
                ));
            }

            for (const enactStatementLine of enactStatementLines) {
                lawBody.append(newStdEL(
                    "EnactStatement",
                    {},
                    enactStatementLine.line.sentencesArray.flat().map(ss => ss.sentences).flat().map(s => s.children).flat(),
                    enactStatementLine.virtualRange,
                ));
            }

            if (toc) {
                lawBody.append(toc.value);
                errors.push(...toc.errors);
            }

            for (const preamble of preambles) {
                lawBody.append(preamble.value);
                errors.push(...preamble.errors);
            }

            for (const [mainProvision, errorLines] of mainProvisionAndErrors) {
                const lastChild = lawBody.children.length > 0 ? lawBody.children[lawBody.children.length - 1] : null;
                if (lastChild && isMainProvision(lastChild)) {
                    lastChild.extend(mainProvision.value.children);
                    Object.assign(lastChild.attr, { ...mainProvision.value.attr, ...lastChild.attr });
                } else {
                    lawBody.append(mainProvision.value);
                }
                errors.push(...mainProvision.errors);
                for (const errorLine of errorLines) {
                    errors.push(new ErrorMessage(
                        `$law: この行をパースできませんでした。line.type: ${errorLine.type}`,
                        errorLine.virtualRange,
                    ));
                }
            }

            for (const [supplOrAppdxItem, errorLines] of supplOrAppdxItemAndErrors) {
                lawBody.append(supplOrAppdxItem.value);
                errors.push(...supplOrAppdxItem.errors);
                for (const errorLine of errorLines) {
                    errors.push(new ErrorMessage(
                        `$law: この行をパースできませんでした。line.type: ${errorLine.type}`,
                        errorLine.virtualRange,
                    ));
                }
            }

            for (const errorLine of notCapturedErrorLines) {
                errors.push(new ErrorMessage(
                    `$law: この行をパースできませんでした。line.type: ${errorLine.type}`,
                    errorLine.virtualRange,
                ));
            }

            lawBody.range = rangeOfELs(lawBody.children);
            law.range = rangeOfELs(law.children);
            return {
                value: law,
                errors,
            };
        })
    )
    ;

export default $law;
