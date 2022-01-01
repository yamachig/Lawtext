import factory from "../factory";
import { articleGroupTitleTag, articleGroupType, parseNamedNum } from "../../../law/lawUtil";
import { $INLINE_EXCLUDE_TRAILING_SPACES } from "../../inline";
import { newStdEL } from "../../../law/std";
import $articleGroupNum from "./$articleGroupNum";
import $indents from "./$indents";
import { ArticleGroupHeadLine, LineType } from "../../../node/line";
import { $__, $_EOL } from "../../lexical";
import { mergeAdjacentTexts } from "../util";


export const $articleGroupHeadLine = factory
    .withName("articleGroupHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and( () => $articleGroupNum, "articleGroupNum")
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
        .action(({ indentsStruct, articleGroupNum, tail, lineEndText, text }) => {
            const inline = mergeAdjacentTexts([
                articleGroupNum.text,
                ...(tail ? [
                    tail.space,
                    ...tail.inline,
                ] : []),
            ]);
            const articleGroupTitle = newStdEL(
                articleGroupTitleTag[articleGroupNum.typeChar],
                {},
                inline,
            );
            const articleGroup = newStdEL(
                articleGroupType[articleGroupNum.typeChar],
                {},
                [articleGroupTitle]
            );
            const num = parseNamedNum(articleGroupNum.text);
            if (num) {
                articleGroup.attr.Num = num;
            }
            return {
                type: LineType.ARG,
                text: text(),
                ...indentsStruct,
                content: articleGroup,
                contentText: articleGroup.text,
                lineEndText,
            } as ArticleGroupHeadLine;
        })
    )
    ;

export default $articleGroupHeadLine;
