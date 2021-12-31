/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "../../law/std";
import { factory } from "../common";
import { $INLINE } from "../inline";
import { $NEWLINE } from "../lexical";
import { $xml_element } from "../xml";


export const $amend_provision = factory
    .withName("amend_provision")
    .action(r => r
        .sequence(c => c
            .and(r => r.seqEqual(":AmendProvision:"))
            .and(() => $NEWLINE)
            .and(r => r
                .oneOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .choice(c => c
                                    .or(() => $xml_element)
                                    .or(r => r
                                        .action(r => r
                                            .sequence(c => c
                                                .and(() => $INLINE, "_inline"),
                                            )
                                        , (({ _inline }) => {
                                            return newStdEL("AmendProvisionSentence", {}, [newStdEL("Sentence", {}, _inline)]);
                                        }),
                                        ),
                                    ),
                                )
                            , "inline")
                            .and(() => $NEWLINE),
                        )
                    , (({ inline }) => {
                        return inline;
                    }),
                    ),
                )
            , "target"),
        )
    , (({ target }) => {
        return newStdEL("AmendProvision", {}, target);
    }),
    )
    ;


export const rules = {
    amend_provision: $amend_provision,
};
