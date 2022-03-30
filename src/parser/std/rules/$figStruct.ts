import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import { isFig, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { Control, Sentences } from "../../../node/cst/inline";
import { EL, rangeOfELs } from "../../../node/el";
import { assertNever } from "../../../util";
import $remarks, { remarksToLines } from "./$remarks";


export const figStructToLines = (figStruct: std.FigStruct, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const figStructTitleTextSentenceChildren = (
        figStruct.children.find(el => el.tag === "FigStructTitle") as std.FigStructTitle | undefined
    )?.children;

    const requireControl = Boolean(figStructTitleTextSentenceChildren) || figStruct.children.length !== 1 || figStruct.children[0].tag !== "Fig";

    if (requireControl) {
        lines.push(new OtherLine(
            null,
            indentTexts.length,
            indentTexts,
            [
                new Control(
                    ":fig-struct:",
                    null,
                    "",
                    null,
                )
            ],
            figStructTitleTextSentenceChildren ? [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, figStructTitleTextSentenceChildren)]
                )
            ] : [],
            CST.EOL,
        ));
    }


    const childrenIndentTexts = requireControl ? [...indentTexts, CST.INDENT] : indentTexts;

    for (const child of figStruct.children) {
        if (child.tag === "FigStructTitle") continue;

        if (child.tag === "Fig") {

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
                        [newStdEL("Sentence", {}, [new EL("__CapturedXML", {}, [child])])],
                    ),
                ],
                CST.EOL,
            ));

        } else if (child.tag === "Remarks") {
            const remarksLines = remarksToLines(child, childrenIndentTexts);
            lines.push(...remarksLines);
        }
        else { assertNever(child); }
    }

    return lines;
};

export const $fig: WithErrorRule<std.Fig> = factory
    .withName("fig")
    .oneMatch(({ item }) => {
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
                errors.push(new ErrorMessage(
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
                        && item.line.type === LineType.OTH
                        && item.line.controls.some(c => /^:fig-struct:$/.exec(c.control))
                    ) {
                        return item;
                    } else {
                        return null;
                    }
                })
            , "titleLine")
            .and(r => r.zeroOrMore(() => $blankLine))
            .and(() => $optBNK_INDENT)
            .and(r => r.zeroOrOne(() => $remarks), "remarks1")
            .and(r => r.zeroOrMore(() => $blankLine))
            .and(() => $fig, "fig")
            .and(r => r.zeroOrMore(() => $blankLine))
            .and(r => r.zeroOrOne(() => $remarks), "remarks2")
            .and(r => r
                .choice(c => c
                    .or(() => $optBNK_DEDENT)
                    .or(r => r
                        .noConsumeRef(r => r
                            .sequence(s => s
                                .and(r => r.zeroOrMore(() => $blankLine))
                                .and(r => r.anyOne(), "unexpected")
                                .action(({ unexpected }) => {
                                    return new ErrorMessage(
                                        "$figStruct: この前にある備考の終了時にインデント解除が必要です。",
                                        unexpected.virtualRange,
                                    );
                                })
                            )
                        )
                    )
                )
            , "error")
            .action(({ titleLine, remarks1, fig, remarks2, error }) => {
                // for (let i = 0; i < children.value.length; i++) {
                //     children.value[i].attr.Num = `${i + 1}`;
                // }
                const figStructTitleText = titleLine.line.sentencesArray.map(ss => ss.sentences).flat().map(s => s.text).join("");
                const figStructTitle = figStructTitleText ? newStdEL(
                    "FigStructTitle",
                    {},
                    [figStructTitleText],
                    titleLine.virtualRange,
                ) : null;
                const figStruct = newStdEL(
                    "FigStruct",
                    {},
                    [
                        ...(figStructTitle ? [figStructTitle] : []),
                        ...(remarks1 ? [remarks1.value] : []),
                        fig.value,
                        ...(remarks2 ? [remarks2.value] : []),
                    ],
                );
                figStruct.range = rangeOfELs(figStruct.children);
                return {
                    value: figStruct,
                    errors: [
                        ...(remarks1?.errors ?? []),
                        ...fig.errors,
                        ...(remarks2?.errors ?? []),
                        ...(error instanceof ErrorMessage ? [error] : []),
                    ],
                };
            })
        )
    )
    ;

export default $figStruct;
