import factory from "../factory";
import { newStdEL } from "../../../law/std";
import $indents from "./$indents";
import { TOCHeadLine, LineType } from "../../../node/line";
import { __Text } from "../../../node/control";
import { $_EOL } from "../../../parser/lexical";


export const $tocHeadLine = factory
    .withName("tocHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
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
        .action(({ indentsStruct, contentStruct, lineEndText, text }) => {
            return {
                type: LineType.TOC,
                text: text(),
                ...indentsStruct,
                ...contentStruct,
                lineEndText,
            } as TOCHeadLine;
        })
    )
    ;

export default $tocHeadLine;
