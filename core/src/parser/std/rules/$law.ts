import { factory } from "../factory";
import { BlankLine, Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, isSingleParentheses, WithErrorRule } from "../util";
import * as std from "../../../law/std";
import { VirtualLine, VirtualOnlyLineType } from "../virtualLine";
import { isAppdxItem, isEnactStatement, isLawBody, isLawNum, isLawTitle, isMainProvision, isPreamble, isSupplProvision, isTOC, newStdEL } from "../../../law/std";
import { Control, Sentences } from "../../../node/cst/inline";
import CST from "../toCSTSettings";
import { assertNever } from "../../../util";
import $toc, { tocToLines } from "./$toc";
import $preamble, { preambleToLines } from "./$preamble";
import $mainProvision, { mainProvisionToLines } from "./$mainProvision";
import $supplProvision, { supplProvisionToLines } from "./$supplProvision";
import { $appdx, $appdxFig, $appdxFormat, $appdxNote, $appdxStyle, $appdxTable, appdxItemToLines } from "./$appdxItem";
import { ErrorMessage } from "../../cst/error";
import { forceSentencesArrayToSentenceChildren, sentencesArrayToString } from "../../cst/rules/$sentencesArray";
import { parseLawNum } from "../../../law/lawNum";
import { rangeOfELs } from "../../../node/el";


/**
 * The renderer for [Law](../../../law/std/StdEL.ts). Please see the source code for the detailed syntax, and the [test code](./$law.spec.ts) for examples.
 */
export const lawToLines = (law: std.Law, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const lawNum = law.children.find(isLawNum);
    const lawBody = law.children.find(isLawBody);
    const lawTitle = lawBody?.children.find(isLawTitle);

    if (lawTitle) {
        lines.push(new OtherLine({
            range: null,
            indentTexts,
            controls: [],
            sentencesArray: [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, lawTitle.children)]
                )
            ],
            lineEndText: CST.EOL,
        }));
    }

    if (lawNum) {
        lines.push(new OtherLine({
            range: null,
            indentTexts,
            controls: [],
            sentencesArray: [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, ["（", ...lawNum.children, "）"])]
                )
            ],
            lineEndText: CST.EOL,
        }));
    }

    if (lawTitle || lawNum) {
        lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
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
            lines.push(...enactStatementToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isTOC(child)) {
            lines.push(...tocToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isPreamble(child)) {
            lines.push(...preambleToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isMainProvision(child)) {
            lines.push(...mainProvisionToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isSupplProvision(child)) {
            lines.push(...supplProvisionToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        } else if (isAppdxItem(child)) {
            lines.push(...appdxItemToLines(child, indentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
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

export const enactStatementControl = ":enact-statement:";

export const enactStatementToLines = (enactStatement: std.EnactStatement, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(new OtherLine({
        range: null,
        indentTexts,
        controls: [
            new Control(
                enactStatementControl,
                null,
                "",
                null,
            ),
        ],
        sentencesArray: [
            new Sentences(
                "",
                null,
                [],
                [newStdEL("Sentence", {}, enactStatement.children)],
            ),
        ],
        lineEndText: CST.EOL,
    }));

    return lines;
};

export const $enactStatement: WithErrorRule<std.EnactStatement> = factory
    .withName("enactStatement")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.controls.some(c => c.control === enactStatementControl)
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "line")
        .action(({ line }) => {
            // for (let i = 0; i < children.value.length; i++) {
            //     children.value[i].attr.Num = `${i + 1}`;
            // }
            const children = forceSentencesArrayToSentenceChildren(line.line.sentencesArray);

            const pos = line.line.indentsEndPos;
            const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            const enactStatement = newStdEL(
                "EnactStatement",
                {},
                children,
                range,
            );
            return {
                value: enactStatement,
                errors: [],
            };
        })
    )
    ;


/**
 * The parser rule for [Law](../../../law/std/StdEL.ts). Please see the source code for the detailed syntax, and the [test code](./$law.spec.ts) for examples.
 */
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
                    .and(() => $enactStatement)
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                )
            )
        , "enactStatements")
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
                                .and(r => r.anyOne(), "captured")
                                .andOmit(r => r.assertNot(({ captured }) =>
                                    (captured.type === LineType.SPR)
                                    || (captured.type === LineType.APP)
                                    || (captured.type === LineType.ART)
                                    || (captured.type === LineType.ARG)
                                ))
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
        .action(({ lawTitleLines, enactStatements, toc, preambles, mainProvisionAndErrors, supplOrAppdxItemAndErrors, notCapturedErrorLines }) => {
            const errors: ErrorMessage[] = [];

            const law = newStdEL(
                "Law",
                {
                    Lang: "ja",
                }
            );
            if (lawTitleLines?.value.lawNumLine) {
                const parentheses = isSingleParentheses(lawTitleLines.value.lawNumLine);
                const lawNum = parentheses
                    ? parentheses.content.text()
                    : sentencesArrayToString(lawTitleLines.value.lawNumLine.line.sentencesArray);
                law.children.push(newStdEL(
                    "LawNum",
                    {},
                    [lawNum],
                    lawTitleLines.value.lawNumLine.line.sentencesArrayRange,
                ));

                const { Era, Year, LawType, Num } = parseLawNum(lawNum);
                if (Era !== null) law.attr.Era = Era;
                if (Year !== null) law.attr.Year = Year.toString();
                if (LawType !== null) law.attr.LawType = LawType;
                law.attr.Num = Num !== null ? Num.toString() : "";
            }

            const lawBody = newStdEL("LawBody");
            law.children.push(lawBody);

            if (lawTitleLines) {
                lawBody.children.push(newStdEL(
                    "LawTitle",
                    {},
                    forceSentencesArrayToSentenceChildren(lawTitleLines.value.lawNameLine.line.sentencesArray),
                    lawTitleLines.value.lawNameLine.virtualRange,
                ));
            }

            lawBody.children.push(...enactStatements.map(v => v.value));
            errors.push(...enactStatements.map(v => v.errors).flat());

            if (toc) {
                lawBody.children.push(toc.value);
                errors.push(...toc.errors);
            }

            for (const preamble of preambles) {
                lawBody.children.push(preamble.value);
                errors.push(...preamble.errors);
            }

            for (const [mainProvision, errorLines] of mainProvisionAndErrors) {
                const lastChild = lawBody.children.length > 0 ? lawBody.children[lawBody.children.length - 1] : null;
                if (lastChild && isMainProvision(lastChild)) {
                    lastChild.children.push(...mainProvision.value.children);
                    Object.assign(lastChild.attr, { ...mainProvision.value.attr, ...lastChild.attr });
                } else {
                    lawBody.children.push(mainProvision.value);
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
                lawBody.children.push(supplOrAppdxItem.value);
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
