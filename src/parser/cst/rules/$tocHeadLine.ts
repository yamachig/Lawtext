import factory from "../factory";
import { newStdEL } from "../../../law/std";
import $indents from "./$indents";
import { TOCHeadLine, LineType } from "../../../node/line";
import { __Text } from "../../../node/control";
import { $_EOL } from "../../../parser/lexical";


export const $tocHeadLine = factory
    .withName("tocHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentStruct")
        .and(r => r
            .sequence(s => s
                .and(r => r.regExp(/^目\s*次/), "label")
                .action(({ label }) => {
                    return {
                        content: newStdEL(
                            "TOC",
                            {},
                            [newStdEL("TOCLabel", {}, [new __Text(label)])],
                        ),
                        contentText: label,
                    };
                })
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ indentStruct, contentStruct, lineEndText, text }) => {
            return {
                type: LineType.TOC,
                text: text(),
                ...indentStruct,
                ...contentStruct,
                lineEndText,
            } as TOCHeadLine;
        })
    )
    ;

export default $tocHeadLine;
