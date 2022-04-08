import { factory } from "../factory";
import { BlankLine, Line, LineType, OtherLine } from "../../../node/cst/line";
import { makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { isAmendProvision, isAmendProvisionSentence, isAppdxItem, isArticle, isArticleGroup, isArticleGroupTitle, isFigStruct, isLawTitle, isList, isNewProvision, isNoteLikeStruct, isPreamble, isRemarks, isSupplNote, isSupplProvisionAppdxItem, isTableStruct, isTOC, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { ErrorMessage } from "../../cst/error";
import { sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { Control, Sentences } from "../../../node/cst/inline";
import { $requireControlParagraphItem, paragraphItemToLines } from "./$paragraphItem";
import $preamble, { preambleToLines } from "./$preamble";
import $articleGroup, { articleGroupToLines } from "./$articleGroup";
import $article, { articleToLines } from "./$article";
import { assertNever, NotImplementedError } from "../../../util";
import $figStruct, { figStructToLines } from "./$figStruct";
import $tableStruct, { tableStructToLines } from "./$tableStruct";
import { $appdx, $appdxFig, $appdxFormat, $appdxNote, $appdxStyle, $appdxTable, appdxItemToLines } from "./$appdxItem";
import { $supplProvisionAppdx, $supplProvisionAppdxStyle, $supplProvisionAppdxTable, supplProvisionAppdxItemToLines } from "./$supplProvisionAppdxItem";
import { $list, listOrSublistToLines } from "./$list";
import { $formatStruct, $noteStruct, $styleStruct, noteLikeStructToLines } from "./$noteLike";
import $toc, { tocToLines } from "./$toc";
import $remarks, { remarksToLines } from "./$remarks";
import $supplNote, { supplNoteToLines } from "./$supplNote";
import { EL, rangeOfELs } from "../../../node/el";

interface AmendProvisionToLinesOptions {
    withControl?: boolean,
}

export const amendProvisionToLines = (
    amendProvision: std.AmendProvision,
    indentTexts: string[],
    options?: AmendProvisionToLinesOptions,
): Line[] => {
    const {
        withControl,
    } = {
        withControl: false,
        ...options,
    };

    const lines: Line[] = [];

    const newProvisionsIndentTexts = [...indentTexts, CST.INDENT];

    for (const child of amendProvision.children) {

        if (isAmendProvisionSentence(child)) {
            lines.push(new OtherLine(
                null,
                indentTexts.length,
                indentTexts,
                withControl ? [
                    new Control(
                        ":amend-provision:",
                        null,
                        "",
                        null,
                    )
                ] : [],
                [
                    new Sentences(
                        "",
                        null,
                        [],
                        child.children,
                    ),
                ],
                CST.EOL,
            ));

        } else if (isNewProvision(child)) {
            for (const cc of child.children) {
                if (isArticle(cc)) {
                    lines.push(...articleToLines(cc, newProvisionsIndentTexts));
                } else if (std.isParagraphItem(cc)) {
                    lines.push(...paragraphItemToLines(cc, newProvisionsIndentTexts));
                } else if (isList(cc)) {
                    lines.push(...listOrSublistToLines(cc, newProvisionsIndentTexts));
                } else if (isTableStruct(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...tableStructToLines(cc, newProvisionsIndentTexts));
                } else if (isFigStruct(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...figStructToLines(cc, newProvisionsIndentTexts));
                } else if (isAppdxItem(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...appdxItemToLines(cc, newProvisionsIndentTexts));
                } else if (isSupplProvisionAppdxItem(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...supplProvisionAppdxItemToLines(cc, newProvisionsIndentTexts));
                } else if (isNoteLikeStruct(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...noteLikeStructToLines(cc, newProvisionsIndentTexts));
                } else if (isRemarks(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...remarksToLines(cc, newProvisionsIndentTexts));
                } else if (isSupplNote(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...supplNoteToLines(cc, newProvisionsIndentTexts));
                } else if (isPreamble(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...preambleToLines(cc, newProvisionsIndentTexts));
                } else if (isTOC(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...tocToLines(cc, newProvisionsIndentTexts));
                } else if (isAmendProvision(cc)) {
                    lines.push(...amendProvisionToLines(cc, newProvisionsIndentTexts, { withControl: true }));
                } else if (isArticleGroup(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...articleGroupToLines(cc, newProvisionsIndentTexts));
                } else if (isArticleGroupTitle(cc) || isLawTitle(cc)) {
                    lines.push(new OtherLine(
                        null,
                        newProvisionsIndentTexts.length,
                        newProvisionsIndentTexts,
                        [],
                        [
                            new Sentences(
                                "",
                                null,
                                [],
                                [newStdEL("Sentence", {}, [new EL("__CapturedXML", {}, [cc])])],
                            ),
                        ],
                        CST.EOL,
                    ));
                }
                else { throw new NotImplementedError(cc.tag); }
            }

        }
        else { assertNever(child); }
    }

    return lines;
};


const $newProvisionsBlock = makeIndentBlockWithCaptureRule(
    "$newProvisionsBlock",
    (factory
        .choice(c => c
            .or(() => $preamble)
            .or(() => $toc)
            .or(() => $articleGroup)
            .or(() => $article)
            .or(() => $requireControlParagraphItem)
            .or(() => $figStruct)
            .or(() => $tableStruct)
            .or(() => $noteStruct)
            .or(() => $styleStruct)
            .or(() => $formatStruct)
            .or(() => $list)
            .or(() => $appdxFig)
            .or(() => $appdxTable)
            .or(() => $appdxStyle)
            .or(() => $appdxNote)
            .or(() => $appdxFormat)
            .or(() => $appdx)
            .or(() => $supplProvisionAppdxStyle)
            .or(() => $supplProvisionAppdxTable)
            .or(() => $supplProvisionAppdx)
            .or(() => $remarks)
            .or(() => $supplNote)
            .or(() => $preamble)
            .orSequence(s => s
                .andOmit(r => r
                    .nextIs(r => r
                        .oneMatch(({ item }) => {
                            if (
                                item.type === LineType.OTH
                                && item.line.controls.some(c => c.control === ":amend-provision:")
                            ) {
                                return item;
                            } else {
                                return null;
                            }
                        })
                    )
                )
                .and(() => $amendProvision)
            )
            .or(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.OTH
                        && item.line.type === LineType.OTH
                        && item.line.sentencesArray.length === 1
                        && item.line.sentencesArray[0].sentences.length === 1
                        && item.line.sentencesArray[0].sentences[0].children.length === 1
                        && typeof item.line.sentencesArray[0].sentences[0].children[0] !== "string"
                        && item.line.sentencesArray[0].sentences[0].children[0].tag === "__CapturedXML"
                        && item.line.sentencesArray[0].sentences[0].children[0].children.length === 1
                        && typeof item.line.sentencesArray[0].sentences[0].children[0].children[0] !== "string"
                    ) {
                        const errors: ErrorMessage[] = [];
                        const el = item.line.sentencesArray[0].sentences[0].children[0].children[0].copy(false) as EL;
                        return {
                            value: el,
                            errors,
                        };
                    } else {
                        return null;
                    }
                })
            )
        )
    ),
);


export const $amendProvision: WithErrorRule<std.AmendProvision> = factory
    .withName("amendProvision")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.type === LineType.OTH
                ) {
                    return newStdEL(
                        "AmendProvisionSentence",
                        {},
                        sentencesArrayToColumnsOrSentences(item.line.sentencesArray),
                        item.line.sentencesArrayRange
                    );
                } else {
                    return null;
                }
            })
        , "amendProvisionSentence")
        .and(r => r
            .zeroOrOne(() => $newProvisionsBlock)
        , "newProvisions")
        .action(({ amendProvisionSentence, newProvisions }) => {

            const children: std.AmendProvision["children"] = [];
            const errors: ErrorMessage[] = [];

            children.push(amendProvisionSentence);

            if (newProvisions) {
                const newProvisionChildren = newProvisions.value.map(c => c.value);
                children.push(newStdEL(
                    "NewProvision",
                    {},
                    newProvisionChildren,
                    rangeOfELs(newProvisionChildren),
                ));
                errors.push(...newProvisions.errors);
            }


            const amendProvision = newStdEL(
                "AmendProvision",
                {},
                children,
                rangeOfELs(children),
            );
            return {
                value: amendProvision,
                errors,
            };
        })
    )
    ;

export default $amendProvision;
