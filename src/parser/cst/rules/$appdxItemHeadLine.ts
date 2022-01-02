import factory from "../factory";
import { $INLINE_EXCLUDE_TRAILING_SPACES } from "../../inline";
import { newStdEL } from "../../../law/std";
import $indents from "./$indents";
import { AppdxItemHeadLine, LineType } from "../../../node/line";
import { $_EOL } from "../../lexical";
import { mergeAdjacentTexts } from "../util";


export const $appdxItemHeadLine = factory
    .withName("appdxItemHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .choice(c => c
                .orSequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r.regExp(/^:appdx:[ 　\t]*/), "control")
                    .action(({ control }) => {
                        return {
                            mainTag: "Appdx",
                            titleTag: "ArithFormulaNum",
                            control,
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r.regExp(/^:appdx-table:[ 　\t]*/), "control")
                    .action(({ control }) => {
                        return {
                            mainTag: "AppdxTable",
                            titleTag: "AppdxTableTitle",
                            control,
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r.regExp(/^:appdx-style:[ 　\t]*/), "control")
                    .action(({ control }) => {
                        return {
                            mainTag: "AppdxStyle",
                            titleTag: "AppdxStyleTitle",
                            control,
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r.regExp(/^:appdx-format:[ 　\t]*/), "control")
                    .action(({ control }) => {
                        return {
                            mainTag: "AppdxFormat",
                            titleTag: "AppdxFormatTitle",
                            control,
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r.regExp(/^:appdx-fig:[ 　\t]*/), "control")
                    .action(({ control }) => {
                        return {
                            mainTag: "AppdxFig",
                            titleTag: "AppdxFigTitle",
                            control,
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r.regExp(/^:appdx-note:[ 　\t]*/), "control")
                    .action(({ control }) => {
                        return {
                            mainTag: "AppdxNote",
                            titleTag: "AppdxNoteTitle",
                            control,
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[別付附]?図/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "AppdxFig",
                            titleTag: "AppdxFigTitle",
                            control: "",
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^(?![付附]則)[^(（]*様式/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "AppdxStyle",
                            titleTag: "AppdxStyleTitle",
                            control: "",
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^(?![付附]則)[^(（]*書式/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "AppdxFormat",
                            titleTag: "AppdxFormatTitle",
                            control: "",
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[別付附]表/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "AppdxTable",
                            titleTag: "AppdxTableTitle",
                            control: "",
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^別[記紙]/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "AppdxNote",
                            titleTag: "AppdxNoteTitle",
                            control: "",
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[付附]録/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "Appdx",
                            titleTag: "ArithFormulaNum",
                            control: "",
                            head,
                        } as const;
                    })
                )
            )
        , "headStruct")
        .and(() => $INLINE_EXCLUDE_TRAILING_SPACES, "tail")
        .and(() => $_EOL, "lineEndText")
        .action(({ indentsStruct, headStruct, tail, lineEndText, text }) => {
            const el = newStdEL(headStruct.mainTag);
            const inline = mergeAdjacentTexts([headStruct.head, ...tail]);
            if (inline.slice(-1)[0]?.tag === "__Parentheses" && inline.slice(-1)[0].attr.type === "round") {
                const numInline = inline.splice(-1, 1);
                el.append(newStdEL(headStruct.titleTag, {}, inline));
                el.append(newStdEL("RelatedArticleNum", {}, numInline));
            } else {
                el.append(newStdEL(headStruct.titleTag, {}, inline));
            }
            return {
                type: LineType.APP,
                text: text(),
                ...indentsStruct,
                content: el,
                contentText: headStruct.control + el.text,
                lineEndText,
            } as AppdxItemHeadLine;
        })
    )
    ;

export default $appdxItemHeadLine;
