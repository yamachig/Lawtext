/* eslint-disable no-irregular-whitespace */
import { EL } from "@coresrc/util";
import { factory } from "../common";
import { $INLINE } from "../inline";
import { $_, $NEWLINE, $__ } from "../lexical";
import { $remarks } from "./remarks";


export const $fig_struct = factory
    .withName("fig_struct")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .zeroOrOne(r => r
                    .sequence(c => c
                        .and(r => r
                            .seqEqual(":fig-struct:"),
                        )
                        .and(r => r
                            .ref(() => $NEWLINE),
                        ),
                    ),
                ),
            )
            .and(r => r
                .ref(() => $fig)
            , "fig")
            .and(r => r
                .zeroOrMore(r => r
                    .ref(() => $remarks),
                )
            , "remarks"),
        )
    , (({ fig, remarks }) => {
        return new EL("FigStruct", {}, [fig].concat(remarks));
    }),
    )
    ;

export const $fig = factory
    .withName("fig")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(".."),
            )
            .and(r => r
                .ref(() => $__),
            )
            .and(r => r
                .seqEqual("figure"),
            )
            .and(r => r
                .ref(() => $_),
            )
            .and(r => r
                .seqEqual("::"),
            )
            .and(r => r
                .ref(() => $_),
            )
            .and(r => r
                .asSlice(r => r
                    .ref(() => $INLINE),
                )
            , "src")
            .and(r => r
                .ref(() => $NEWLINE),
            ),
        )
    , (({ src }) => {
        return new EL("Fig", { src: src });
    }),
    )
    ;


export const rules = {
    fig_struct: $fig_struct,
    fig: $fig,
};
