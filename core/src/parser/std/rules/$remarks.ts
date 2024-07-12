import { factory } from "../factory";
import type { Line } from "../../../node/cst/line";
import { LineType, OtherLine } from "../../../node/cst/line";
import type { WithErrorRule } from "../util";
import { $blankLine, makeIndentBlockWithCaptureRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import type { ErrorMessage } from "../../cst/error";
import $paragraphItem, { paragraphItemToLines } from "./$paragraphItem";
import { AttrEntry, Control, Sentences } from "../../../node/cst/inline";
import { assertNever, omit } from "../../../util";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { forceSentencesArrayToSentenceChildren, sentencesArrayToString } from "../../cst/rules/$sentencesArray";
import { rangeOfELs } from "../../../node/el";
import { keepLeadingSpacesControl, ignoreTitleControl } from "../../cst/rules/$otherLine";
import parseCST from "../../cst/parse";
import { mergeAdjacentTextsWithString } from "../../cst/util";
import { __Text } from "../../../node/el/controls";

export const remarksControl = ":remarks:";
export const remarksLabelPtn = /^(?:備\s*考|注)\s*$/;

/**
 * The renderer for {@link std.Remarks}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$remarks.spec.ts) for examples.
 */
export const remarksToLines = (remarks: std.Remarks, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const remarksLabel = remarks.children.find(el => el.tag === "RemarksLabel") as std.RemarksLabel | undefined;

    const remarksLabelSentenceChildren = remarksLabel?.children;
    const controls = remarksLabelSentenceChildren && remarksLabelPtn.exec(sentenceChildrenToString(remarksLabelSentenceChildren)) ? [] : [
        new Control(
            remarksControl,
            null,
            "",
            null,
        ),
    ];

    const remarksLabelSentences = new Sentences(
        "",
        null,
        [],
        [newStdEL("Sentence", {}, remarksLabelSentenceChildren)]
    );

    lines.push(new OtherLine({
        range: null,
        indentTexts,
        controls,
        sentencesArray: remarksLabelSentenceChildren ? [remarksLabelSentences] : [],
        lineEndText: CST.EOL,
    }));

    if (remarksLabel) {
        for (const [name, value] of Object.entries(remarksLabel.attr)) {
            if ((std.defaultAttrs[remarksLabel.tag] as Record<string, string>)[name] === value) continue;
            remarksLabelSentences.attrEntries.push(
                new AttrEntry(
                    `[${name}="${value}"]`,
                    [name, value],
                    null,
                    "",
                    null,
                )
            );
        }
    }

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    const restChildren = remarks.children.filter(c => c.tag !== "RemarksLabel") as Exclude<std.Remarks["children"][number], std.RemarksLabel>[];

    for (const child of restChildren) {
        if (child.tag === "Sentence") {
            const line = new OtherLine({
                range: null,
                indentTexts: childrenIndentTexts,
                controls: [],
                sentencesArray: [
                    new Sentences(
                        "",
                        null,
                        [],
                        [child]
                    ),
                ],
                lineEndText: CST.EOL,
            });
            const lineText = sentencesArrayToString(line.sentencesArray);
            try {
                const parsedLines = parseCST(lineText);
                if (parsedLines.value[0].type !== LineType.OTH) {
                    line.controls.push(new Control(
                        ignoreTitleControl,
                        null,
                        "",
                        null,
                    ));
                }
            } catch (e) {
                //
            }
            // eslint-disable-next-line no-irregular-whitespace
            if (/^[ 　\t]+/.test(child.text())) {
                line.controls.push(new Control(
                    keepLeadingSpacesControl,
                    null,
                    "",
                    null,
                ));
            }
            lines.push(line);
        } else if (child.tag === "Item") {
            const itemLines = paragraphItemToLines(child, childrenIndentTexts, { defaultTag: "Item" });
            lines.push(...itemLines);
        }
        else { assertNever(child); }
    }


    return lines;
};

const $remarksChildrenBlock = makeIndentBlockWithCaptureRule(
    "$remarksChildrenBlock",
    (factory
        .choice(c => c
            .orSequence(s => s
                .and(() => $paragraphItem("Item"), "paragraphItem")
                .andOmit(r => r.assert(({ paragraphItem }) => std.isItem(paragraphItem.value)))
                .action(({ paragraphItem }) => {
                    return {
                        value: [paragraphItem.value as std.Item],
                        errors: paragraphItem.errors,
                    };
                })
            )
            .or(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.OTH
                        && item.line.sentencesArray.length > 0
                    ) {
                        const sentenceChildren: std.Sentence["children"] = [];
                        for (const sentences of item.line.sentencesArray) {
                            sentenceChildren.push(new __Text(sentences.leadingSpace, sentences.leadingSpaceRange));
                            for (const sentence of sentences.sentences) {
                                sentenceChildren.push(...sentence.children);
                            }
                        }

                        const sentence = newStdEL(
                            "Sentence",
                            omit(item.line.sentencesArray[0].sentences[0].attr, "Function", "Num"),
                            mergeAdjacentTextsWithString(sentenceChildren),
                            item.line.sentencesArrayRange,
                        );
                        return {
                            value: [sentence],
                            errors: [],
                        };
                    } else {
                        return null;
                    }
                })
            )
        )
    ),
);

/**
 * The parser rule for {@link std.Remarks}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$remarks.spec.ts) for examples.
 */
export const $remarks: WithErrorRule<std.Remarks> = factory
    .withName("remarks")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.type === LineType.OTH
                    && (
                        (
                            item.line.controls.some(c => c.control === remarksControl)
                        )
                        || (
                            item.line.sentencesArray.length > 0
                            && remarksLabelPtn.exec(sentencesArrayToString(
                                item.line.sentencesArray,
                                {
                                    withoutAttrs: true,
                                },
                            ))
                        )
                    )
                ) {
                    return item;
                } else {
                    return null;
                }
            })
        , "labelLine")
        .and(r => r.zeroOrMore(() => $blankLine))
        .and(() => $remarksChildrenBlock, "childrenBlock")
        .action(({ labelLine, childrenBlock }) => {

            const children: std.Remarks["children"] = [];
            const errors: ErrorMessage[] = [];

            const remarksLabelSentenceChildren = forceSentencesArrayToSentenceChildren(labelLine.line.sentencesArray);
            const attrEntries = labelLine.line.sentencesArray[0]?.attrEntries ?? [];
            const remarksLabel = ((remarksLabelSentenceChildren.length > 0) || attrEntries.length > 0) ? newStdEL(
                "RemarksLabel",
                Object.fromEntries(attrEntries.map(attrEntry => attrEntry.entry)),
                remarksLabelSentenceChildren,
                labelLine.line.sentencesArrayRange,
            ) : null;

            if (remarksLabel) {
                children.push(remarksLabel);
            }

            children.push(...childrenBlock.value.flat().map(v => v.value).flat());
            errors.push(...childrenBlock.value.flat().map(v => v.errors).flat());
            errors.push(...childrenBlock.errors);

            const pos = labelLine.line.indentsEndPos;
            const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
            if (range && pos !== null) {
                range[0] = pos;
            }
            const remarks = newStdEL(
                "Remarks",
                {},
                children,
                range,
            );
            return {
                value: remarks,
                errors,
            };
        })
    )
    ;

export default $remarks;
