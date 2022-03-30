import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import { isNoteLike, isNoteLikeStructTitle, newStdEL, noteLikeStructTags, noteLikeStructTitleTags, StdELType } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { Control, Sentences } from "../../../node/cst/inline";
import { rangeOfELs } from "../../../node/el";
import { assertNever } from "../../../util";
import $remarks, { remarksToLines } from "./$remarks";
import $any, { anyToLines } from "./$any";

export const noteLikeStructControl = {
    NoteStruct: ":note-struct:",
    StyleStruct: ":style-struct:",
    FormatStruct: ":format-struct:",
} as const;

export const noteLikeToLines = (noteLike: std.NoteLike, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    lines.push(...noteLike.children.map(c => anyToLines(c, indentTexts)).flat());

    return lines;
};


export const noteLikeStructToLines = (noteLikeStruct: std.NoteLikeStruct, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const noteLikeStructTitleTag = noteLikeStructTitleTags[noteLikeStructTags.indexOf(noteLikeStruct.tag)];

    const noteLikeStructTitleSentenceChildren = (
        (noteLikeStruct.children as (typeof noteLikeStruct.children)[number][])
            .find(el => el.tag === noteLikeStructTitleTag) as std.NoteLikeStructTitle | undefined
    )?.children;

    lines.push(new OtherLine(
        null,
        indentTexts.length,
        indentTexts,
        [
            new Control(
                noteLikeStructControl[noteLikeStruct.tag],
                null,
                "",
                null,
            )
        ],
        noteLikeStructTitleSentenceChildren ? [
            new Sentences(
                "",
                null,
                [],
                [newStdEL("Sentence", {}, noteLikeStructTitleSentenceChildren)]
            )
        ] : [],
        CST.EOL,
    ));

    const childrenIndentTexts = [...indentTexts, CST.INDENT];

    for (const child of noteLikeStruct.children) {
        if (isNoteLikeStructTitle(child)) continue;

        if (isNoteLike(child)) {
            lines.push(...noteLikeToLines(child, childrenIndentTexts));
        } else if (child.tag === "Remarks") {
            const remarksLines = remarksToLines(child, childrenIndentTexts);
            lines.push(...remarksLines);
        }
        else { assertNever(child); }
    }

    return lines;
};

export const makeNoteLikeRule = <TTag extends (typeof std.noteLikeTags)[number]>(tag: TTag): WithErrorRule<StdELType<TTag>> => factory
    .withName("noteLike")
    .sequence(s => s
        .and(() => $any, "any")
        .action(({ any }) => {
            const el = newStdEL(tag, {}, any.value);
            el.range = rangeOfELs(el.children);
            return {
                value: el,
                errors: any.errors,
            };
        })
    )
    ;

export const $note = makeNoteLikeRule("Note");
export const $style = makeNoteLikeRule("Style");
export const $format = makeNoteLikeRule("Format");

const noteLikeRules = {
    "NoteStruct": $note,
    "StyleStruct": $style,
    "FormatStruct": $format,
} as const;

export const makeNoteLikeStructRule = <TTag extends (typeof std.noteLikeStructTags)[number]>(tag: TTag): WithErrorRule<StdELType<TTag>> => {
    const noteLikeRule = noteLikeRules[tag] as WithErrorRule<
        TTag extends "NoteStruct" ? std.NoteLike
        : TTag extends "StyleStruct" ? std.Style
        : TTag extends "FormatStruct" ? std.Format
        : never
    >;
    return factory
        .withName("noteLikeStruct")
        .sequence(s => s
            .and(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.OTH
                    && item.line.type === LineType.OTH
                    && item.line.controls.some(c => c.control === noteLikeStructControl[tag])
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
            .and(() => noteLikeRule, "noteLike")
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
                                        "noteLikeStruct: この前にある記／様式／書式の終了時にインデント解除が必要です。",
                                        unexpected.virtualRange,
                                    );
                                })
                            )
                        )
                    )
                )
            , "error")
            .action(({ titleLine, remarks1, noteLike, remarks2, error }) => {
            // for (let i = 0; i < children.value.length; i++) {
            //     children.value[i].attr.Num = `${i + 1}`;
            // }
                const noteLikeStructTitleSentenceChildren = titleLine.line.sentencesArray.map(ss => ss.sentences).flat().map(s => s.children).flat();
                const noteLikeStructTitle = noteLikeStructTitleSentenceChildren.length > 0 ? newStdEL(
                    std.noteLikeStructTitleTags[std.noteLikeStructTags.indexOf(tag)],
                    {},
                    noteLikeStructTitleSentenceChildren,
                    titleLine.virtualRange,
                ) : null;
                const noteLikeStruct = newStdEL(
                    tag,
                    {},
                    [
                        ...(noteLikeStructTitle ? [noteLikeStructTitle] : []),
                        ...(remarks1 ? [remarks1.value] : []),
                        noteLike.value,
                        ...(remarks2 ? [remarks2.value] : []),
                    ],
                );
                noteLikeStruct.range = rangeOfELs(noteLikeStruct.children);
                return {
                    value: noteLikeStruct,
                    errors: [
                        ...(remarks1?.errors ?? []),
                        ...noteLike.errors,
                        ...(remarks2?.errors ?? []),
                        ...(error instanceof ErrorMessage ? [error] : []),
                    ],
                };
            })
        )
    ;
};

export const $noteStruct = makeNoteLikeStructRule("NoteStruct");
export const $styleStruct = makeNoteLikeStructRule("StyleStruct");
export const $formatStruct = makeNoteLikeStructRule("FormatStruct");

