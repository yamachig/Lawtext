import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import $paragraphItem, { paragraphItemToLines } from "./$paragraphItem";
import { Control, Sentences } from "../../../node/cst/inline";
import { assertNever } from "../../../util";
import { sentenceChildrenToString } from "../../cst/rules/$sentenceChildren";
import { forceSentencesArrayToSentenceChildren, sentencesArrayToString } from "../../cst/rules/$sentencesArray";
import { rangeOfELs } from "../../../node/el";

export const remarksControl = ":remarks:";
export const remarksLabelPtn = /^(?:備\s*考|注)\s*$/;

/**
 * The renderer for [Remarks](../../../law/std/StdEL.ts). Please see the source code for the detailed syntax, and the [test code](./$remarks.spec.ts) for examples.
 */
export const remarksToLines = (remarks: std.Remarks, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const remarksLabelSentenceChildren = (
        remarks.children.find(el => el.tag === "RemarksLabel") as std.RemarksLabel | undefined
    )?.children;
    const controls = remarksLabelSentenceChildren && remarksLabelPtn.exec(sentenceChildrenToString(remarksLabelSentenceChildren)) ? [] : [
        new Control(
            remarksControl,
            null,
            "",
            null,
        ),
    ];

    lines.push(new OtherLine({
        range: null,
        indentTexts,
        controls,
        sentencesArray: remarksLabelSentenceChildren ? [
            new Sentences(
                "",
                null,
                [],
                [newStdEL("Sentence", {}, remarksLabelSentenceChildren)]
            )
        ] : [],
        lineEndText: CST.EOL,
    }));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    for (const child of remarks.children) {
        if (child.tag === "RemarksLabel") continue;

        if (child.tag === "Sentence") {
            lines.push(new OtherLine({
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
            }));
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
                        return {
                            value: item.line.sentencesArray.flat().map(ss => ss.sentences).flat(),
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
 * The parser rule for [Remarks](../../../law/std/StdEL.ts). Please see the source code for the detailed syntax, and the [test code](./$remarks.spec.ts) for examples.
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
                            && remarksLabelPtn.exec(sentencesArrayToString(item.line.sentencesArray))
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
            const remarksLabel = remarksLabelSentenceChildren.length > 0 ? newStdEL(
                "RemarksLabel",
                {},
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
