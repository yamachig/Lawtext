import factory from "../factory";
import { newStdEL } from "../../../law/std";
import $indents from "./$indents";
import { SupplProvisionHeadLine, LineType } from "../../../node/line";
import { $_EOL } from "../../../parser/lexical";
import { $ROUND_PARENTHESES_INLINE } from "../../../parser/inline";
import { __Text } from "../../../node/control";


export const $supplProvisionHeadLine = factory
    .withName("supplProvisionHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .sequence(s => s
                // eslint-disable-next-line no-irregular-whitespace
                .and(r => r.regExp(/^[附付][ 　\t]*則/), "head")
                .and(r => r.zeroOrOne(() => $ROUND_PARENTHESES_INLINE), "amendLawNum")
                .and(r => r
                    // eslint-disable-next-line no-irregular-whitespace
                    .zeroOrOne(r => r.regExp(/^[ 　\t]*抄/))
                , "extract")
                .action(({ head, amendLawNum, extract, text }) => {
                    const supplProvision = newStdEL(
                        "SupplProvision",
                        {},
                        [newStdEL("SupplProvisionLabel", {}, [new __Text(head)])],
                    );
                    if (amendLawNum) {
                        supplProvision.attr.AmendLawNum = amendLawNum.content;
                    }
                    if (extract) {
                        supplProvision.attr.Extract = "true";
                    }
                    return {
                        content: supplProvision,
                        contentText: text(),
                    };
                })
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ indentsStruct, contentStruct, lineEndText, text }) => {
            return {
                type: LineType.SPR,
                text: text(),
                ...indentsStruct,
                ...contentStruct,
                lineEndText,
            } as SupplProvisionHeadLine;
        })
    )
    ;

export default $supplProvisionHeadLine;
