import factory from "../factory";
import $indents from "./$indents";
import { OtherLine, LineType } from "../../../node/line";
import { $_, $_EOL } from "../../../parser/lexical";
import $columnsOrSentences from "./$columnsOrSentences";


export const $otherLine = factory
    .withName("otherLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .sequence(s => s
                .and(r => r
                    .zeroOrMore(r => r
                        .sequence(s => s
                            .and(() => $_)
                            // eslint-disable-next-line no-irregular-whitespace
                            .and(r => r.regExp(/^:[^:\r\n]+:/), "control")
                            .action(({ control }) => control)
                        )
                    )
                , "controls")
                .and(r => r
                    .zeroOrOne(r => r
                        .sequence(s => s
                            .and(() => $_)
                            .and(() => $columnsOrSentences, "inline")
                            .action(({ inline }) => inline)
                        )
                    )
                , "inline")
                .action(({ controls, inline, text }) => {
                    return {
                        content: inline ?? [],
                        contentText: text(),
                        controls,
                    };
                })
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ indentsStruct, contentStruct, lineEndText, text }) => {
            return {
                type: LineType.OTH,
                text: text(),
                ...indentsStruct,
                ...contentStruct,
                lineEndText,
            } as OtherLine;
        })
    )
    ;

export default $otherLine;
