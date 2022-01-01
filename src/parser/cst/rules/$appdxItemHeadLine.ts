import factory from "../factory";
import { $INLINE_EXCLUDE_TRAILING_SPACES } from "../../inline";
import { newStdEL } from "../../../law/std";
import $indents from "./$indents";
import { AppdxItemHeadLine, LineType } from "../../../node/line";
import { $_EOL } from "../../lexical";
import { mergeAdjacentTexts } from "../util";


export const $appdxHeadLine = factory
    .withName("appdxHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r.regExp(/^付\s*録/), "head")
        .and(() => $INLINE_EXCLUDE_TRAILING_SPACES, "tail")
        .and(() => $_EOL, "lineEndText")
        .action(({ indentsStruct, head, tail, lineEndText, text }) => {
            const appdx = newStdEL("Appdx");
            const inline = mergeAdjacentTexts([
                head,
                ...tail,
            ]);
            if (inline.slice(-1)[0].tag === "__Parentheses" && inline.slice(-1)[0].attr.type === "round") {
                const numInline = inline.splice(-1, 1);
                appdx.append(newStdEL("ArithFormulaNum", {}, inline));
                appdx.append(newStdEL("RelatedArticleNum", {}, numInline));
            } else {
                appdx.append(newStdEL("ArithFormulaNum", {}, inline));
            }
            return {
                type: LineType.APP,
                text: text(),
                ...indentsStruct,
                content: appdx,
                contentText: appdx.text,
                lineEndText,
            } as AppdxItemHeadLine;
        })
    )
    ;

export const $appdxItemHeadLine = factory
    .withName("appdxItemHeadLine")
    .choice(c => c
        .or(() => $appdxHeadLine)
    )
    ;

export default $appdxItemHeadLine;
