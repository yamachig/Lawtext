import factory from "../factory";
import $indents from "./$indents";
import { ParagraphItemLine, LineType } from "../../../node/line";
import { $__, $_EOL } from "../../lexical";
import $columnsOrSentences from "./$columnsOrSentences";
import makeRangesRule from "./makeRangesRule";
import $paragraphItemTitle from "./$paragraphItemTitle";

const { $ranges: $paragraphItemRanges } = makeRangesRule(() => $paragraphItemTitle);


export const $paragraphItemLine = factory
    .withName("paragraphItemLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .sequence(s => s
                .and( r => r.asSlice(() => $paragraphItemRanges), "paragraphItemTitleText")
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
                .action(({ paragraphItemTitleText, inline, text }) => {
                    return {
                        contentHead: paragraphItemTitleText,
                        contentTail: inline ?? [],
                        contentText: text(),
                    };
                })
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ indentsStruct, contentStruct, lineEndText, text }) => {
            return {
                type: LineType.PIT,
                text: text(),
                ...indentsStruct,
                ...contentStruct,
                lineEndText,
            } as ParagraphItemLine;
        })
    )
    ;

export default $paragraphItemLine;
