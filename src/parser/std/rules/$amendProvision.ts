import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import { isAmendProvisionSentence, isArticle, isNewProvision, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { ErrorMessage } from "../../cst/error";
import { sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { Sentences } from "../../../node/cst/inline";
import $paragraphItem from "./$paragraphItem";
import $preamble from "./$preamble";
import $articleGroup from "./$articleGroup";
import $article, { articleToLines } from "./$article";
import { assertNever, NotImplementedError } from "../../../util";
import { rangeOfELs } from "../../../node/el";

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
                    const newProvisionLines = articleToLines(cc, newProvisionsIndentTexts);
                    lines.push(...newProvisionLines);
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
