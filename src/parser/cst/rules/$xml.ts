/* eslint-disable no-irregular-whitespace */
import { EL } from "../../../node/el";
import { __Text } from "../../../node/control";
import { factory } from "../factory";
import { WithErrorRule } from "../util";
import { $_ } from "./lexical";

export const $xml = factory
    .withName("xml")
    .zeroOrMore(r => r
        .choice(c => c
            .or(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .asSlice(r => r
                                .oneOrMore(r => r.regExp(/^[^<>]/)),
                            )
                        , "text"),
                    )
                , (({ text }) => {
                    return { value: new __Text(text), errors: [] };
                }),
                ),
            )
            .or(() => $xmlElement),
        ),
    )
;

export default $xml;

export const $xmlElement: WithErrorRule<EL> = factory
    .withName("xmlElement")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("<"))
                    .and(r => r
                        .nextIsNot(r => r.seqEqual("/")),
                    )
                    .and(r => r
                        .asSlice(r => r
                            .oneOrMore(r => r.regExp(/^[^/<> ="\t\r\n]/)),
                        )
                    , "tag")
                    .and(r => r
                        .zeroOrMore(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(() => $_)
                                    .and(r => r
                                        .asSlice(r => r
                                            .oneOrMore(r => r.regExp(/^[^/<> ="\t\r\n]/)),
                                        )
                                    , "name")
                                    .and(() => $_)
                                    .and(r => r.seqEqual("="))
                                    .and(() => $_)
                                    .and(r => r.seqEqual("\""))
                                    .and(r => r
                                        .asSlice(r => r
                                            .oneOrMore(r => r.regExp(/^[^"]/)),
                                        )
                                    , "value")
                                    .and(r => r.seqEqual("\"")),
                                )
                            , (({ name, value }) => {
                                const ret = {} as Record<string, string>;
                                ret[name] = value;
                                return ret;
                            }),
                            ),
                        )
                    , "attr")
                    .and(() => $_)
                    .and(r => r.seqEqual(">"))
                    .and(() => $xml, "children")
                    .and(r => r
                        .sequence(c => c
                            .and(r => r.seqEqual("</"))
                            .and(() => $_)
                            .and(r => r
                                .asSlice(r => r
                                    .oneOrMore(r => r.regExp(/^[^/<> ="\t\r\n]/)),
                                )
                            , "end_tag")
                            .and(() => $_)
                            .and(r => r.seqEqual(">"))
                            .and(r => r
                                .assert(({ tag, end_tag }) => {
                                    return end_tag === tag;
                                }),
                            ),
                        ),
                    ),
                )
            , (({ tag, attr, children }) => {
                return {
                    value: new EL(tag, Object.assign({}, ...attr), children.map(c => c.value )),
                    errors: children.map(c => c.errors).flat(),
                };
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.seqEqual("<"))
                    .and(r => r
                        .nextIsNot(r => r.seqEqual("/")),
                    )
                    .and(r => r
                        .asSlice(r => r
                            .oneOrMore(r => r.regExp(/^[^/<> ="\t\r\n]/)),
                        )
                    , "tag")
                    .and(r => r
                        .zeroOrMore(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(() => $_)
                                    .and(r => r
                                        .asSlice(r => r
                                            .oneOrMore(r => r.regExp(/^[^/<> ="\t\r\n]/)),
                                        )
                                    , "name")
                                    .and(() => $_)
                                    .and(r => r.seqEqual("="))
                                    .and(() => $_)
                                    .and(r => r.seqEqual("\""))
                                    .and(r => r
                                        .asSlice(r => r
                                            .oneOrMore(r => r.regExp(/^[^"]/)),
                                        )
                                    , "value")
                                    .and(r => r.seqEqual("\"")),
                                )
                            , (({ name, value }) => {
                                const ret = {} as Record<string, string>;
                                ret[name] = value;
                                return ret;
                            }),
                            ),
                        )
                    , "attr")
                    .and(() => $_)
                    .and(r => r.seqEqual("/>")),
                )
            , (({ tag, attr }) => {
                return { value: new EL(tag, Object.assign({}, ...attr)), errors: [] };
            }),
            ),
        ),
    )
;
