import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { isListOrSublist, isListOrSublistSentence, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import { makeDoubleIndentBlockWithCaptureRule, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import factory from "../factory";
import { ErrorMessage } from "../../cst/error";
import CST from "../toCSTSettings";
import { assertNever, Diff } from "../../../util";

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
        nextSublistRule: WithErrorRule<Diff<std.ListOrSublist, std.List>> | null,
    ): WithErrorRule<
TRet
> => {
    const sentenceTag = std.listOrSublistSentenceTags[std.listOrSublistTags.indexOf(tag)];
    const sublistsBlockRule = nextSublistRule
        ? (
            factory
                .sequence(s => s
                    .and(r => r
                        .ref(
                            makeDoubleIndentBlockWithCaptureRule(
                                `$${tag.toLowerCase()}ChildrenBlock`,
                                nextSublistRule,
                            )
                        )
                    , "block")
                    .action(({ block }) => {
                        return {
                            value: block.value.map(v => v.value),
                            errors: [
                                ...block.value.map(v => v.errors).flat(),
                                ...block.errors,
                            ]
                        };
                    })
                )
        )
        : null;
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
            .and(r => r
                .zeroOrOne(
                    sublistsBlockRule
                        ? sublistsBlockRule
                        : r
                            .sequence(s => s
                                .and(r => r.assert(() => true))
                                .action(() => null)
                            ))
            , "childrenBlock")
            .action(({ listOrSublistSentenceLine, childrenBlock }) => {
                const children: std.ListOrSublist["children"][number][] = [];
                const errors: ErrorMessage[] = [];

                const listOrSublistSentence = newStdEL(
                    sentenceTag,
                    {},
                    sentencesArrayToColumnsOrSentences(listOrSublistSentenceLine.line.sentencesArray),
                );
                children.push(listOrSublistSentence.setRangeFromChildren());

                if (childrenBlock) {
                    children.push(...childrenBlock.value);
                    errors.push(...childrenBlock.errors);
                }

                const listOrSublist = newStdEL(
                    tag,
                    {},
                    children,
                );
                return {
                    value: listOrSublist.setRangeFromChildren() as unknown as TRet,
                    errors,
                };
            })
        );
};

export const $sublist3 = makelistOrSublistRule("Sublist3", null);
export const $sublist2 = makelistOrSublistRule("Sublist2", $sublist3);
export const $sublist1 = makelistOrSublistRule("Sublist1", $sublist2);
export const $list = makelistOrSublistRule("List", $sublist1);

export const $listsOuter = makeIndentBlockWithCaptureRule(
    "$listsOuter",
    (factory.ref(() => $list)),
);
