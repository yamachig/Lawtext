/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "../../../law/std";
import { factory } from "../common";
import { $INLINE } from "../../cst/rules/inline";
import { $_, $NEWLINE, $__ } from "../../cst/rules/lexical";
import { $remarks } from "./remarks";


export const $fig_struct = factory
    .withName("fig_struct")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(r => r.seqEqual(":fig-struct:"))
                        .and(() => $NEWLINE),
                    ),
                ),
            )
            .and(() => $fig, "fig")
            .and(r => r.zeroOrMore(() => $remarks), "remarks"),
        )
    , (({ fig, remarks }) => {
        return newStdEL("FigStruct", {}, [fig, ...remarks]);
    }),
    )
    ;

export const $fig = factory
    .withName("fig")
    .action(r => r
        .sequence(c => c
            .and(r => r.seqEqual(".."))
            .and(() => $__)
            .and(r => r.seqEqual("figure"))
            .and(() => $_)
            .and(r => r.seqEqual("::"))
            .and(() => $_)
            .and(r => r.asSlice(() => $INLINE), "src")
            .and(() => $NEWLINE),
        )
    , (({ src }) => {
        return newStdEL("Fig", { src: src });
    }),
    )
    ;


export const rules = {
    fig_struct: $fig_struct,
    fig: $fig,
};
