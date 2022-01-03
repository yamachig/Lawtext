import factory from "../factory";
import { newStdEL } from "../../../law/std";
import $indents from "./$indents";
import { TableColumnLine, LineType } from "../../../node/line";
import { $_, $_EOL } from "../../../parser/lexical";
import $squareAttr from "./$squareAttr";
import $columnsOrSentences from "./$columnsOrSentences";


export const $tableColumnLine = factory
    .withName("tableColumnLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .sequence(s => s
                // eslint-disable-next-line no-irregular-whitespace
                .and(r => r.regExp(/^(?:\*[ 　\t]*)?-/), "head")
                .and(r => r
                    .sequence(c => c
                        .and(r => r
                            .zeroOrMore(r => r
                                .sequence(s => s
                                    .and(() => $_)
                                    .and(() => $squareAttr, "entry")
                                    .action(({ entry }) => entry)
                                )
                            )
                        , "entries")
                        .action(({ entries }) => Object.fromEntries(entries))
                    )
                , "attr")
                .and(r => r
                    .zeroOrOne(r => r
                        .sequence(s => s
                            .and(() => $_)
                            .and(() => $columnsOrSentences, "inline")
                            .action(({ inline }) => inline)
                        )
                    )
                , "inline")
                .action(({ head, attr, inline, text }) => {
                    return {
                        content: newStdEL(
                            "TableColumn",
                            attr,
                            inline ?? [],
                        ),
                        contentText: text(),
                        isFirstColumn: head.startsWith("*"),
                    };
                })
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ indentsStruct, contentStruct, lineEndText, text }) => {
            return {
                type: LineType.TBL,
                text: text(),
                ...indentsStruct,
                ...contentStruct,
                lineEndText,
            } as TableColumnLine;
        })
    )
    ;

export default $tableColumnLine;
