import { factory } from "../factory";
import { Line, LineType, OtherLine } from "../../../node/cst/line";
import { $blankLine, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { isNoteLike, isNoteLikeStructTitle, newStdEL, noteLikeStructTags, noteLikeStructTitleTags, StdELType } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { Control, Sentences } from "../../../node/cst/inline";
import { rangeOfELs } from "../../../node/el";
import { assertNever } from "../../../util";
import $remarks, { remarksToLines } from "./$remarks";
import $any, { anyToLines } from "./$any";
import { forceSentencesArrayToSentenceChildren } from "../../cst/rules/$sentencesArray";

/**
 * The renderer for [note-like item (NoteLike)](../../../law/std/helpers.ts). Please see the source code for the detailed syntax, and the [test code](./$noteLike.spec.ts) for examples.
 */
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


/**
 * The renderer for [note-like struct item (NoteLikeStruct)](../../../law/std/helpers.ts). Please see the source code for the detailed syntax, and the [test code](./$noteLike.spec.ts) for examples.
 */
export const noteLikeStructToLines = (noteLikeStruct: std.NoteLikeStruct, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const noteLikeStructTitleTag = noteLikeStructTitleTags[noteLikeStructTags.indexOf(noteLikeStruct.tag)];

    const noteLikeStructTitleSentenceChildren = (
        (noteLikeStruct.children as (typeof noteLikeStruct.children)[number][])
            .find(el => el.tag === noteLikeStructTitleTag) as std.NoteLikeStructTitle | undefined
    )?.children;

    lines.push(new OtherLine({
        range: null,
        indentTexts,
        controls: [
            new Control(
                noteLikeStructControl[noteLikeStruct.tag],
                null,
                "",
                null,
            )
        ],
        sentencesArray: noteLikeStructTitleSentenceChildren ? [
            new Sentences(
                "",
                null,
                [],
                [newStdEL("Sentence", {}, noteLikeStructTitleSentenceChildren)]
            )
        ] : [],
        lineEndText: CST.EOL,
    }));

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
            const el = newStdEL(tag, {}, any.value) as unknown as StdELType<TTag>;
            el.range = rangeOfELs(el.children);
            return {
                value: el,
                errors: any.errors,
            };
        })
    )
    ;

/**
 * The parser rule for [Note](../../../law/std/StdEL.ts). Please see the source code for the detailed syntax, and the [test code](./$noteLike.spec.ts) for examples.
 */
export const $note = makeNoteLikeRule("Note");

/**
 * The parser rule for [Style](../../../law/std/StdEL.ts). Please see the source code for the detailed syntax, and the [test code](./$noteLike.spec.ts) for examples.
 */
export const $style = makeNoteLikeRule("Style");

/**
 * The parser rule for [Format](../../../law/std/StdEL.ts). Please see the source code for the detailed syntax, and the [test code](./$noteLike.spec.ts) for examples.
 */
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
    const sublistsBlockRule = (
        factory
            .sequence(s => s
                .and(r => r
                    .ref(
                        makeIndentBlockWithCaptureRule(
                            `$${tag[0].toLowerCase()}${tag.slice(1)}ChildrenBlock`,
                            (
                                factory
                                    .choice(c => c
                                        .or(() => $remarks)
                                        .or(() => noteLikeRule)
                                    )
                            ),
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
    );
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
            .and(r => r
                .zeroOrOne(() => sublistsBlockRule)
            , "childrenBlock")
            .action(({ titleLine, childrenBlock }) => {
                const children: std.NoteLikeStruct["children"][number][] = [];
                const errors: ErrorMessage[] = [];

                const noteLikeStructTitleSentenceChildren = forceSentencesArrayToSentenceChildren(titleLine.line.sentencesArray);
                const noteLikeStructTitle = noteLikeStructTitleSentenceChildren.length > 0 ? newStdEL(
                    std.noteLikeStructTitleTags[std.noteLikeStructTags.indexOf(tag)],
                    {},
                    noteLikeStructTitleSentenceChildren,
                    titleLine.line.sentencesArrayRange,
                ) : null;


                if (noteLikeStructTitle) {
                    children.push(noteLikeStructTitle);
                }

                if (childrenBlock) {
                    children.push(...childrenBlock.value);
                    errors.push(...childrenBlock.errors);
                }

                const pos = titleLine.line.indentsEndPos;
                const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
                if (range && pos !== null) {
                    range[0] = pos;
                }
                const noteLikeStruct = newStdEL(
                    tag,
                    {},
                    children,
                    range,
                ) as unknown as StdELType<TTag>;
                return {
                    value: noteLikeStruct,
                    errors,
                };
            })
        )
    ;
};

/**
 * The parser rule for [NoteStruct](../../../law/std/StdEL.ts). Please see the source code for the detailed syntax, and the [test code](./$noteLike.spec.ts) for examples.
 */
export const $noteStruct = makeNoteLikeStructRule("NoteStruct");

/**
 * The parser rule for [StyleStruct](../../../law/std/StdEL.ts). Please see the source code for the detailed syntax, and the [test code](./$noteLike.spec.ts) for examples.
 */
export const $styleStruct = makeNoteLikeStructRule("StyleStruct");

/**
 * The parser rule for [FormatStruct](../../../law/std/StdEL.ts). Please see the source code for the detailed syntax, and the [test code](./$noteLike.spec.ts) for examples.
 */
export const $formatStruct = makeNoteLikeStructRule("FormatStruct");

