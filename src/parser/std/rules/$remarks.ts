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

export const remarksControl = ":remarks:";
export const remarksLabelPtn = /^(?:備\s*考|注)\s*$/;

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

    lines.push(new OtherLine(
        null,
        indentTexts.length,
        indentTexts,
        controls,
        remarksLabelSentenceChildren ? [
            new Sentences(
                "",
                null,
                [],
                [newStdEL("Sentence", {}, remarksLabelSentenceChildren)]
            )
        ] : [],
        CST.EOL,
    ));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    for (const child of remarks.children) {
        if (child.tag === "RemarksLabel") continue;

        if (child.tag === "Sentence") {
            lines.push(new OtherLine(
                null,
                childrenIndentTexts.length,
                childrenIndentTexts,
                [],
                [
                    new Sentences(
                        "",
                        null,
                        [],
                        [child]
                    ),
                ],
                CST.EOL,
            ));
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
                            && remarksLabelPtn.exec(item.line.sentencesArray[0].sentences[0].text)
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

            const remarksLabelSentenceChildren = labelLine.line.sentencesArray.map(ss => ss.sentences).flat().map(s => s.children).flat();
            const remarksLabel = remarksLabelSentenceChildren.length > 0 ? newStdEL(
                "RemarksLabel",
                {},
                remarksLabelSentenceChildren,
                labelLine.virtualRange,
            ) : null;

            if (remarksLabel) {
                children.push(remarksLabel);
            }

            children.push(...childrenBlock.value.flat().map(v => v.value).flat());
            errors.push(...childrenBlock.value.flat().map(v => v.errors).flat());
            errors.push(...childrenBlock.errors);

            const remarks = newStdEL(
                "Remarks",
                {},
                children,
            );
            return {
                value: remarks.setRangeFromChildren(),
                errors,
            };
        })
    )
    ;

export default $remarks;
