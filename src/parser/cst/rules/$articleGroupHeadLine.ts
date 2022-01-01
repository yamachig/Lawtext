import factory from "../factory";
import { articleGroupTitleTag, articleGroupType, parseNamedNum } from "../../../law/lawUtil";
import { $INLINE } from "../../inline";
import { newStdEL } from "../../../law/std";
import $articleGroupNum from "./$articleGroupNum";
import $indents from "./$indents";
import { ArticleGroupHeadLine, LineType } from "../../../node/line";
import { $__, $EOL } from "../../lexical";
import { __Text } from "../../../node/control";
import { EL } from "../../../node/el";


export const $articleGroupHeadLine = factory
    .withName("articleGroupHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentStruct")
        .and( () => $articleGroupNum, "articleGroupNum")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(() => $__, "space")
                    .and(() => $INLINE, "inline")
                    .action(({ space, inline }) => {
                        return { space, inline };
                    })
                )
            )
        , "tail")
        .and(() => $EOL, "eol")
        .action(({ indentStruct, articleGroupNum, tail, eol, text }) => {
            const headText = [articleGroupNum.text];
            const tailChildren: (__Text | EL)[] = [];
            const lineEndText = [eol];
            if (tail) {
                headText.push(tail.space);
                if (tail.inline[0]?.tag === "__Text") {
                    headText.push(tail.inline[0].text);
                    tailChildren.push(...tail.inline.slice(1));
                } else {
                    tailChildren.push(...tail.inline);
                }
                if (tailChildren.slice(-1)[0]?.tag === "__Text") {
                    const m = /^(.*?)(\s+)/.exec(tailChildren.slice(-1)[0].text);
                    if (m) {
                        const replacedTailChildrenTail: (__Text | EL)[] = [];
                        if (m[1] !== "") {
                            replacedTailChildrenTail.push(new __Text(m[1]));
                        }
                        tailChildren.splice(-1, 1);
                        tailChildren.push(...replacedTailChildrenTail);
                        lineEndText.unshift(m[2]);
                    }
                }
            }
            const articleGroupTitle = newStdEL(
                articleGroupTitleTag[articleGroupNum.typeChar],
                {},
                [
                    new __Text(headText.join("")),
                    ...tailChildren,
                ],
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
                ...indentStruct,
                content: articleGroup,
                contentText: articleGroup.text,
                lineEndText: lineEndText.join(""),
            } as ArticleGroupHeadLine;
        })
    )
    ;

export default $articleGroupHeadLine;
