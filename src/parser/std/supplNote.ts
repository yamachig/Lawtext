/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "@coresrc/std_law";
import { factory } from "../common";
import { $INLINE } from "../inline";
import { $_, $NEWLINE } from "../lexical";


export const $suppl_note = factory
    .withName("suppl_note")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(":SupplNote:"),
            )
            .and(r => r
                .ref(() => $_),
            )
            .and(r => r
                .ref(() => $INLINE)
            , "inline")
            .and(r => r
                .oneOrMore(r => r
                    .ref(() => $NEWLINE),
                ),
            ),
        )
    , (({ inline }) => {
        return newStdEL("SupplNote", {}, inline);
    }),
    )
    ;


export const rules = {
    suppl_note: $suppl_note,
};
