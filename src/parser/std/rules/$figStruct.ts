import { factory } from "../factory";
import { BlankLine, Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { isFig, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { Control, Sentences } from "../../../node/cst/inline";
import { EL, rangeOfELs } from "../../../node/el";
import { assertNever } from "../../../util";
import $remarks, { remarksToLines } from "./$remarks";
import { forceSentencesArrayToSentenceChildren } from "../../cst/rules/$sentencesArray";

export const figStructControl = ":fig-struct:";

export const figToLines = (fig: std.Fig, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(new OtherLine({
        range: null,
        indentTexts,
        controls: [],
        sentencesArray: [
            new Sentences(
                "",
                null,
                [],
                [newStdEL("Sentence", {}, [new EL("__CapturedXML", {}, [fig])])],
            ),
        ],
        lineEndText: CST.EOL,
    }));

    return lines;
};

export const figStructToLines = (figStruct: std.FigStruct, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const figStructTitleSentenceChildren = (
        figStruct.children.find(el => el.tag === "FigStructTitle") as std.FigStructTitle | undefined
    )?.children;

    const requireControl = Boolean(figStructTitleSentenceChildren) || figStruct.children.length !== 1 || figStruct.children[0].tag !== "Fig";

    if (requireControl) {
        lines.push(new OtherLine({
            range: null,
            indentTexts,
            controls: [
                new Control(
                    figStructControl,
                    null,
                    "",
                    null,
                )
            ],
            sentencesArray: figStructTitleSentenceChildren ? [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, figStructTitleSentenceChildren)]
                )
            ] : [],
            lineEndText: CST.EOL,
        }));
    }


    const childrenIndentTexts = requireControl ? [...indentTexts, CST.INDENT] : indentTexts;

    for (const child of figStruct.children) {
        if (child.tag === "FigStructTitle") continue;

        if (child.tag === "Fig") {
            lines.push(...figToLines(child, childrenIndentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

        } else if (child.tag === "Remarks") {
            lines.push(...remarksToLines(child, childrenIndentTexts));
            lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        }
        else { assertNever(child); }
    }

    return lines;
};

export const $fig: WithErrorRule<std.Fig> = factory
    .withName("fig")
    .oneMatch(({ item, newErrorMessage }) => {
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
            && isFig(item.line.sentencesArray[0].sentences[0].children[0].children[0])
        ) {
            const errors: ErrorMessage[] = [];
            const fig = item.line.sentencesArray[0].sentences[0].children[0].children[0].copy(false) as std.Fig;
            if (!("src" in fig.attr)) {
                errors.push(newErrorMessage(
                    "$figStruct: Figタグ に src 属性が設定されていません。",
                    item.virtualRange,
                ));
                fig.attr.src = "";
            }
            return {
                value: fig,
                errors,
            };
        } else {
            return null;
        }
    })
    ;


const $figStructChildrenBlock = makeIndentBlockWithCaptureRule(
    "$figStructChildrenBlock",
    (factory
        .choice(c => c
            .or(() => $fig)
            .or(() => $remarks)
        )
    ),
);

export const $figStruct: WithErrorRule<std.FigStruct> = factory
    .withName("figStruct")
    .choice(c => c
        .orSequence(s => s
            .and(() => $fig, "fig")
            .action(({ fig }) => {
                const figStruct = newStdEL(
                    "FigStruct",
                    {},
                    [fig.value],
                );
                figStruct.range = rangeOfELs(figStruct.children);
                return {
                    value: figStruct,
                    errors: fig.errors,
                };
            })
        )
        .orSequence(s => s
            .and(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.OTH
                        && item.line.controls.some(c => c.control === figStructControl)
                    ) {
                        return item;
                    } else {
                        return null;
                    }
                })
            , "titleLine")
            .and(r => r.zeroOrMore(() => $blankLine))
            .and(r => r
                .zeroOrOne(() => $figStructChildrenBlock)
            , "childrenBlock")
            .action(({ titleLine, childrenBlock }) => {

                const children: std.FigStruct["children"] = [];
                const errors: ErrorMessage[] = [];

                const figStructTitleSentenceChildren = forceSentencesArrayToSentenceChildren(titleLine.line.sentencesArray);
                const figStructTitle = figStructTitleSentenceChildren.length > 0 ? newStdEL(
                    "FigStructTitle",
                    {},
                    figStructTitleSentenceChildren,
                    titleLine.line.sentencesArrayRange,
                ) : null;

                if (figStructTitle) {
                    children.push(figStructTitle);
                }

                if (childrenBlock) {
                    children.push(...childrenBlock.value.flat().map(v => v.value).flat());
                    errors.push(...childrenBlock.value.flat().map(v => v.errors).flat());
                    errors.push(...childrenBlock.errors);
                }

                const pos = titleLine.line.indentsEndPos;
                const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
                if (range && pos !== null) {
                    range[0] = pos;
                }
                const figStruct = newStdEL(
                    "FigStruct",
                    {},
                    children,
                    range,
                );

                return {
                    value: figStruct,
                    errors,
                };
            })
        )
    )
    ;

export default $figStruct;
