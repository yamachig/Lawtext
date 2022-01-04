import factory from "../factory";
import { articleGroupType } from "../../../law/lawUtil";
import { $INLINE_EXCLUDE_TRAILING_SPACES } from "./inline";
import $articleGroupNum from "./$articleGroupNum";
import $indents from "./$indents";
import { ArticleGroupHeadLine } from "../../../node/cst/line";
import { $__, $_EOL } from "./lexical";


export const $articleGroupHeadLine = factory
    .withName("articleGroupHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(() => $articleGroupNum, "articleGroupNum")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(() => $__, "space")
                    .and(() => $INLINE_EXCLUDE_TRAILING_SPACES, "inline")
                    .action(({ space, inline }) => {
                        return { space, inline };
                    })
                )
            )
        , "tail")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, articleGroupNum, tail, lineEndText }) => {
            return new ArticleGroupHeadLine(
                range(),
                indentsStruct.indentDepth,
                indentsStruct.indentTexts,
                articleGroupType[articleGroupNum.typeChar],
                articleGroupNum.text,
                tail?.space ?? "",
                tail?.inline ?? [],
                lineEndText,
            );
        })
    )
    ;

export default $articleGroupHeadLine;
