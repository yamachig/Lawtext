import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { WithErrorRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { isSentenceChildEL, Sentences } from "../../../node/cst/inline";
import { NotImplementedError } from "../../../util";
import $remarks, { remarksToLines } from "./$remarks";
import { amendProvisionToLines } from "./$amendProvision";
import $arithFormula, { arithFormulaToLines } from "./$arithFormula";
import $article, { articleToLines } from "./$article";
import $paragraphItem, { paragraphItemToLines } from "./$paragraphItem";
import $articleGroup, { articleGroupToLines } from "./$articleGroup";
import $figStruct, { figStructToLines } from "./$figStruct";
import { $list, listOrSublistToLines } from "./$list";
import { $format, $formatStruct, $note, $noteStruct, $style, $styleStruct, noteLikeStructToLines, noteLikeToLines } from "./$noteLike";
import $preamble, { preambleToLines } from "./$preamble";
import $tableStruct, { tableStructToLines, tableToLines } from "./$tableStruct";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";


export const anyToLines = (any: (std.StdEL | std.__EL | string), indentTexts: string[]): Line[] => {
    const lines: Line[] = [];
    if (typeof any === "string" || isSentenceChildEL(any)) {
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
                    [newStdEL("Sentence", {}, [any])],
                ),
            ],
            CST.EOL,
        ));
    }
    else if (std.isAmendProvision(any)) { return amendProvisionToLines(any, indentTexts); }
    else if (std.isArithFormula(any)) { return arithFormulaToLines(any, indentTexts); }
    else if (std.isArticle(any)) { return articleToLines(any, indentTexts); }
    else if (std.isArticleGroup(any)) { return articleGroupToLines(any, indentTexts); }
    else if (std.isFigStruct(any)) { return figStructToLines(any, indentTexts); }
    else if (std.isListOrSublist(any)) { return listOrSublistToLines(any, indentTexts); }
    else if (std.isNoteLike(any)) { return noteLikeToLines(any, indentTexts); }
    else if (std.isNoteLikeStruct(any)) { return noteLikeStructToLines(any, indentTexts); }
    else if (std.isParagraphItem(any)) { return paragraphItemToLines(any, indentTexts); }
    else if (std.isPreamble(any)) { return preambleToLines(any, indentTexts); }
    else if (std.isRemarks(any)) { return remarksToLines(any, indentTexts); }
    else if (std.isTable(any)) { return tableToLines(any, indentTexts); }
    else if (std.isTableStruct(any)) { return tableStructToLines(any, indentTexts); }
    else if (std.isColumn(any) || std.isSentence(any)) {
        lines.push(new OtherLine(
            null,
            indentTexts.length,
            indentTexts,
            [],
            columnsOrSentencesToSentencesArray([any]),
            CST.EOL,
        ));
    }
    else { throw new NotImplementedError(`anyToLines: ${any.tag}`); }
    // else { assertNever(any); }
    return lines;
};

export const $any: WithErrorRule<(std.StdEL | std.__EL | string)[]> = factory
    .withName("any")
    .choice(c => c
        .orSequence(s => s
            .and(r => r.choice(c => c
                // .or(() => $amendProvision)
                .or(() => $arithFormula)
                .or(() => $article)
                .or(() => $articleGroup)
                .or(() => $figStruct)
                .or(() => $list)
                .or(() => $note)
                .or(() => $style)
                .or(() => $format)
                .or(() => $noteStruct)
                .or(() => $styleStruct)
                .or(() => $formatStruct)
                .or(() => $paragraphItem)
                .or(() => $preamble)
                .or(() => $remarks)
                .or(() => $tableStruct)
            ), "any")
            .action(({ any }) => ({ value: [any.value], errors: any.errors }))
        )
        .or(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                ) {
                    return {
                        value: sentencesArrayToColumnsOrSentences(item.line.sentencesArray),
                        errors: [],
                    };
                } else {
                    return null;
                }
            })
        )
    )
    ;

export default $any;
