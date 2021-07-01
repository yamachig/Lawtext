/* eslint-disable no-irregular-whitespace */
import { EL } from "@coresrc/util";
import { factory } from "../common";
import { $INLINE } from "../inline";
import { $NEWLINE } from "../lexical";
import { $xml_element } from "../xml";


export const $amend_provision = factory
    .withName("amend_provision")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .seqEqual(":AmendProvision:"),
            )
            .and(r => r
                .ref(() => $NEWLINE),
            )
            .and(r => r
                .oneOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .choice(c => c
                                    .or(r => r
                                        .ref(() => $xml_element),
                                    )
                                    .or(r => r
                                        .action(r => r
                                            .sequence(c => c
                                                .and(r => r
                                                    .ref(() => $INLINE)
                                                , "_inline"),
                                            )
                                        , (({ _inline }) => {
                                            return new EL("AmendProvisionSentence", {}, [new EL("Sentence", {}, _inline)]);
                                        }),
                                        ),
                                    ),
                                )
                            , "inline")
                            .and(r => r
                                .ref(() => $NEWLINE),
                            ),
                        )
                    , (({ inline }) => {
                        return inline;
                    }),
                    ),
                )
            , "target"),
        )
    , (({ target }) => {
        return new EL("AmendProvision", {}, target);
    }),
    )
    ;


export const rules = {
    amend_provision: $amend_provision,
};
