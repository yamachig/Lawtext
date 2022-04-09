import { Line, LineType, TableColumnLine } from "../../../node/cst/line";
import { isListOrSublist, isListOrSublistSentence, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import { $blankLine, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import factory from "../factory";
import { ErrorMessage } from "../../cst/error";
import CST from "../toCSTSettings";
import { assertNever, Diff } from "../../../util";
import { rangeOfELs } from "../../../node/el";

export const listOrSublistToLines = (listOrSublist: std.ListOrSublist, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    for (const child of listOrSublist.children) {

        if (isListOrSublistSentence(child)) {
            lines.push(new TableColumnLine({
                range: null,
                indentTexts,
                firstColumnIndicator: "",
                midIndicatorsSpace: "",
                columnIndicator: "-",
                midSpace: " ",
                attrEntries: [],
                multilineIndicator: "",
                sentencesArray: columnsOrSentencesToSentencesArray(child.children),
                lineEndText: CST.EOL,
            }));
            // lines.push(new OtherLine(
            //     null,
            //     indentTexts.length,
            //     indentTexts,
            //     [],
            //     columnsOrSentencesToSentencesArray(child.children),
            //     CST.EOL,
            // ));
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
        ruleName: string,
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
                            makeIndentBlockWithCaptureRule(
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
        .withName(ruleName)
        .sequence(s => s
            .and(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.TBL
                        && item.line.firstColumnIndicator === ""
                    ) {
                        return item;
                    } else {
                        return null;
                    }
                })
            , "line")
            .andOmit(r => r.zeroOrMore(() => $blankLine))
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
            .action(({ line, childrenBlock }) => {
                const children: std.ListOrSublist["children"][number][] = [];
                const errors: ErrorMessage[] = [];

                const listOrSublistSentenceChildren = sentencesArrayToColumnsOrSentences(line.line.sentencesArray);
                const listOrSublistSentence = newStdEL(
                    sentenceTag,
                    {},
                    listOrSublistSentenceChildren,
                    rangeOfELs(listOrSublistSentenceChildren),
                );
                children.push(listOrSublistSentence);

                if (childrenBlock) {
                    children.push(...childrenBlock.value);
                    errors.push(...childrenBlock.errors);
                }

                const listOrSublist = newStdEL(
                    tag,
                    {},
                    children,
                    rangeOfELs(children),
                );
                return {
                    value: listOrSublist as unknown as TRet,
                    errors,
                };
            })
        );
};

export const $sublist3 = makelistOrSublistRule("$sublist3", "Sublist3", null);
export const $sublist2 = makelistOrSublistRule("$sublist2", "Sublist2", $sublist3);
export const $sublist1 = makelistOrSublistRule("$sublist1", "Sublist1", $sublist2);
export const $list = makelistOrSublistRule("$list", "List", $sublist1);

// export const $listsOuter = makeIndentBlockWithCaptureRule(
//     "$listsOuter",
//     (factory.ref(() => $list)),
// );
