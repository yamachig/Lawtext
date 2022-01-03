import factory from "../factory";
import { parseNamedNum } from "../../../law/lawUtil";
import { newStdEL } from "../../../law/std";
import $indents from "./$indents";
import { ArticleLine, LineType } from "../../../node/line";
import { $__, $_EOL } from "../../lexical";
import $articleTitle from "./$articleTitle";
import $columnsOrSentences from "./$columnsOrSentences";
import { __Text } from "../../../node/control";
import makeRangesRule from "./makeRangesRule";

const { $ranges: $articleRanges } = makeRangesRule(() => $articleTitle);


export const $articleLine = factory
    .withName("articleLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .sequence(s => s
                .and( r => r.asSlice(() => $articleRanges), "articleTitleText")
                .and(r => r
                    .zeroOrOne(r => r
                        .sequence(c => c
                            .and(() => $__)
                            .and(() => $columnsOrSentences, "inline")
                            .action(({ inline }) => {
                                return inline;
                            })
                        )
                    )
                , "inline")
                .action(({ articleTitleText, inline, text }) => {
                    const articleTitle = newStdEL(
                        "ArticleTitle",
                        {},
                        [new __Text(articleTitleText)],
                    );
                    const article = newStdEL(
                        "Article",
                        {},
                        [articleTitle]
                    );
                    const num = parseNamedNum(articleTitleText);
                    if (num) {
                        article.attr.Num = num;
                    }
                    if (inline) {
                        const paragraph = newStdEL(
                            "Paragraph",
                            {
                                Num: "1"
                            },
                            [
                                newStdEL("ParagraphNum"),
                                newStdEL("ParagraphSentence", {}, inline),
                            ],
                        );
                        article.append(paragraph);
                    }
                    return {
                        content: article,
                        contentText: text(),
                    };
                })
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ indentsStruct, contentStruct, lineEndText, text }) => {
            return {
                type: LineType.ART,
                text: text(),
                ...indentsStruct,
                ...contentStruct,
                lineEndText,
            } as ArticleLine;
        })
    )
    ;

export default $articleLine;
