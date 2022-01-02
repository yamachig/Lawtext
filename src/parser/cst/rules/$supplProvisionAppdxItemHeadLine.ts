import factory from "../factory";
import { $INLINE_EXCLUDE_TRAILING_SPACES } from "../../inline";
import { newStdEL } from "../../../law/std";
import $indents from "./$indents";
import { SupplProvisionAppdxItemHeadLine, LineType } from "../../../node/line";
import { $_EOL } from "../../lexical";
import { mergeAdjacentTexts } from "../util";


export const $supplProvisionAppdxItemHeadLine = factory
    .withName("supplProvisionAppdxItemHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .choice(c => c
                .orSequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r.regExp(/^:suppl-provision-appdx:[ 　\t]*/), "control")
                    .action(({ control }) => {
                        return {
                            mainTag: "SupplProvisionAppdx",
                            titleTag: "ArithFormulaNum",
                            control,
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r.regExp(/^:suppl-provision-appdx-table:[ 　\t]*/), "control")
                    .action(({ control }) => {
                        return {
                            mainTag: "SupplProvisionAppdxTable",
                            titleTag: "SupplProvisionAppdxTableTitle",
                            control,
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    // eslint-disable-next-line no-irregular-whitespace
                    .and(r => r.regExp(/^:suppl-provision-appdx-style:[ 　\t]*/), "control")
                    .action(({ control }) => {
                        return {
                            mainTag: "SupplProvisionAppdxStyle",
                            titleTag: "SupplProvisionAppdxStyleTitle",
                            control,
                            head: "",
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[付附]則[^(（]*様式/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "SupplProvisionAppdxStyle",
                            titleTag: "SupplProvisionAppdxStyleTitle",
                            control: "",
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[付附]則[別付附]表/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "SupplProvisionAppdxTable",
                            titleTag: "SupplProvisionAppdxTableTitle",
                            control: "",
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[付附]則[付附]録/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "SupplProvisionAppdx",
                            titleTag: "ArithFormulaNum",
                            control: "",
                            head,
                        } as const;
                    })
                )
                .orSequence(s => s
                    .and(r => r.regExp(/^[付附]則(?:別表)/), "head")
                    .action(({ head }) => {
                        return {
                            mainTag: "SupplProvisionAppdxTable",
                            titleTag: "SupplProvisionAppdxTableTitle",
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
                type: LineType.SPA,
                text: text(),
                ...indentsStruct,
                content: el,
                contentText: headStruct.control + el.text,
                lineEndText,
            } as SupplProvisionAppdxItemHeadLine;
        })
    )
    ;

export default $supplProvisionAppdxItemHeadLine;
