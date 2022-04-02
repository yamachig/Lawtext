import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import { isAmendProvisionSentence, isArticle, isFigStruct, isNewProvision, isTableStruct, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { ErrorMessage } from "../../cst/error";
import { sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { Sentences } from "../../../node/cst/inline";
import $paragraphItem, { paragraphItemToLines } from "./$paragraphItem";
import $preamble from "./$preamble";
import $articleGroup from "./$articleGroup";
import $article, { articleToLines } from "./$article";
import { assertNever, NotImplementedError } from "../../../util";
import { rangeOfELs } from "../../../node/el";
import $figStruct, { figStructToLines } from "./$figStruct";
import { isParagraphItem } from "../../out_ std --copy/lawUtil";
import { tableStructToLines } from "./$tableStruct";

export const amendProvisionToLines = (amendProvision: std.AmendProvision, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const newProvisionsIndentTexts = [...indentTexts, CST.INDENT];

    for (const child of amendProvision.children) {

        if (isAmendProvisionSentence(child)) {
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
                        child.children,
                    ),
                ],
                CST.EOL,
            ));

        } else if (isNewProvision(child)) {
            for (const cc of child.children) {
                if (isArticle(cc)) {
                    lines.push(...articleToLines(cc, newProvisionsIndentTexts));
                } else if (isParagraphItem(cc)) {
                    lines.push(...paragraphItemToLines(cc, newProvisionsIndentTexts));
                } else if (isTableStruct(cc)) {
                    lines.push(...tableStructToLines(cc, newProvisionsIndentTexts));
                } else if (isFigStruct(cc)) {
                    lines.push(...figStructToLines(cc, newProvisionsIndentTexts));
                }
                else { throw new NotImplementedError(cc.tag); }
            }

        }
        else { assertNever(child); }
    }

    return lines;
};


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
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(() => $optBNK_INDENT)
                    .and(r => r
                        .oneOrMore(r => r
                            .choice(c => c
                            // .or(() => $lawTitle) // TODO: Implement
                                .or(() => $preamble)
                            // .or(() => $toc) // TODO: Implement
                                .or(() => $articleGroup)
                                .or(() => $article)
                                .or(() => $paragraphItem)
                                .or(() => $figStruct)
                            // .or(() => $list) // TODO: Implement
                            // .or(() => $appdxItem) // TODO: Implement
                            // .or(() => $structItem) // TODO: Implement
                            )
                        )
                    , "children")
                    .and(r => r
                        .choice(c => c
                            .or(() => $optBNK_DEDENT)
                            .or(r => r
                                .noConsumeRef(r => r
                                    .sequence(s => s
                                        .and(r => r.zeroOrMore(() => $blankLine))
                                        .and(r => r.anyOne(), "unexpected")
                                        .action(({ unexpected, newErrorMessage }) => {
                                            return newErrorMessage(
                                                "$amendProvision: この前にある改正文の終了時にインデント解除が必要です。",
                                                unexpected.virtualRange,
                                            );
                                        })
                                    )
                                )
                            )
                        )
                    , "error")
                    .action(({ children, error }) => {
                        const newProvision = newStdEL(
                            "NewProvision",
                            {},
                            children.map(c => c.value),
                        );
                        newProvision.range = rangeOfELs(newProvision.children);
                        return {
                            value: [newProvision],
                            errors: [
                                ...children.map(c => c.errors).flat(),
                                ...(error instanceof ErrorMessage ? [error] : []),
                            ],
                        };
                    })
                )
            )
        , "newProvisions")
        .action(({ amendProvisionSentence, error, newProvisions }) => {
            const amendProvision = newStdEL(
                "AmendProvision",
                {},
                [
                    amendProvisionSentence,
                    ...(newProvisions?.value ?? []),
                ],
            );
            amendProvision.range = rangeOfELs(amendProvision.children);
            return {
                value: amendProvision,
                errors: [
                    ...(newProvisions?.errors ?? []),
                    ...(error instanceof ErrorMessage ? [error] : []),
                ],
            };
        })
    )
    ;

export default $amendProvision;
