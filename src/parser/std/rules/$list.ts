import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { isListOrSublist, isListOrSublistSentence, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import { WithErrorRule } from "../util";
import factory from "../factory";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT } from "../util";
import { ErrorMessage } from "../../cst/error";
import { rangeOfELs } from "../../../node/el";
import CST from "../toCSTSettings";
import { assertNever } from "../../../util";

export const listOrSublistToLines = (listOrSublist: std.ListOrSublist, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const childrenIndentTexts = [...indentTexts, CST.INDENT, CST.INDENT];

    for (const child of listOrSublist.children) {

        if (isListOrSublistSentence(child)) {
            lines.push(new OtherLine(
                null,
                indentTexts.length,
                indentTexts,
                [],
                columnsOrSentencesToSentencesArray(child.children),
                CST.EOL,
            ));
        } else if (isListOrSublist(child)) {
            const listOrSublistLines = listOrSublistToLines(child, childrenIndentTexts);
            lines.push(...listOrSublistLines);
        }
        else { assertNever(child); }
    }

    return lines;
};

export const makelistOrSublistRule = <
    TTag extends (typeof std.listOrSublistTags)[number],
    TRet = TTag extends "List" ? std.List
    : TTag extends "Sublist1" ? std.Sublist1
    : TTag extends "Sublist2" ? std.Sublist2
    : TTag extends "Sublist3" ? std.Sublist3
    : never
>(
        tag: TTag,
        nextSublistRule: WithErrorRule<std.ListOrSublist> | null,
    ): WithErrorRule<
TRet
> => {
    const sentenceTag = std.listOrSublistSentenceTags[std.listOrSublistTags.indexOf(tag)];
    return factory
        .withName("listOrSublist")
        .sequence(s => s
            .and(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.OTH
                        && item.line.type === LineType.OTH
                    ) {
                        return item;
                    } else {
                        return null;
                    }
                })
            , "listOrSublistSentenceLine")
            .and(r =>
                nextSublistRule ? (
                    r
                        .zeroOrOne(r => r
                            .sequence(s => s
                                .and(() => $optBNK_INDENT)
                                .and(() => $optBNK_INDENT)
                                .and(r => r
                                    .oneOrMore(r => r
                                        .sequence(s => s
                                            .andOmit(r => r.zeroOrMore(() => $blankLine))
                                            .and(() => nextSublistRule)
                                        )
                                    )
                                , "children")
                                .and(r => r
                                    .choice(c => c
                                        .orSequence(s => s
                                            .and(() => $optBNK_DEDENT)
                                            .and(() => $optBNK_DEDENT)
                                        )
                                        .or(r => r
                                            .noConsumeRef(r => r
                                                .sequence(s => s
                                                    .and(r => r.zeroOrMore(() => $blankLine))
                                                    .and(r => r.anyOne(), "unexpected")
                                                    .action(({ unexpected, newErrorMessage }) => {
                                                        return newErrorMessage(
                                                            "$listOrSublist: この前にある列記の終了時にインデント解除が必要です。",
                                                            unexpected.virtualRange,
                                                        );
                                                    })
                                                )
                                            )
                                        )
                                    )
                                , "error")
                                .action(({ children, error }) => {
                                    return {
                                        value: children.map(c => c.value),
                                        errors: [
                                            ...children.map(c => c.errors).flat(),
                                            ...(error instanceof ErrorMessage ? [error] : []),
                                        ],
                                    };
                                })
                            )
                        )
                ) : r
                    .sequence(s => s
                        .and(r => r.assert(() => true))
                        .action(() => null)
                    )
            , "children")
            .action(({ listOrSublistSentenceLine, error, children }) => {
                const listOrSublistSentence = newStdEL(
                    sentenceTag,
                    {},
                    sentencesArrayToColumnsOrSentences(listOrSublistSentenceLine.line.sentencesArray),
                );
                listOrSublistSentence.range = rangeOfELs(listOrSublistSentence.children);
                const listOrSublist = newStdEL(
                    tag,
                    {},
                    [
                        listOrSublistSentence,
                        ...(children ? children.value : []),
                    ],
                );
                listOrSublist.range = rangeOfELs(listOrSublist.children);
                return {
                    value: listOrSublist as unknown as TRet,
                    errors: [
                        ...(children?.errors ?? []),
                        ...(error instanceof ErrorMessage ? [error] : []),
                    ],
                };
            })
        );
};

export const $sublist3 = makelistOrSublistRule("Sublist3", null);
export const $sublist2 = makelistOrSublistRule("Sublist2", $sublist3);
export const $sublist1 = makelistOrSublistRule("Sublist1", $sublist2);
export const $list = makelistOrSublistRule("List", $sublist1);

export const $listsOuter: WithErrorRule<std.List[]> = factory
    .withName("listsOuter")
    .sequence(s => s
        .and(() => $optBNK_INDENT)
        .and(r => r
            .oneOrMore(r => r
                .sequence(s => s
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                    .and(() => $list)
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
                                    "$listsOuter: この前にある列記の終了時にインデント解除が必要です。",
                                    unexpected.virtualRange,
                                );
                            })
                        )
                    )
                )
            )
        , "error")
        .action(({ children, error }) => {
            return {
                value: children.map(c => c.value),
                errors: [
                    ...children.map(c => c.errors).flat(),
                    ...(error instanceof ErrorMessage ? [error] : []),
                ],
            };
        })
    );
