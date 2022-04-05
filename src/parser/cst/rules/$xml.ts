/* eslint-disable no-irregular-whitespace */
import { EL } from "../../../node/el";
import { __Text } from "../../../node/control";
import { factory } from "../factory";
import { WithErrorRule } from "../util";
import { $_ } from "./lexical";

export const $xml: WithErrorRule<EL> = factory
    .withName("xml")
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
                    .and(r => r
                        .zeroOrMore(r => r
                            .choice(c => c
                                .or(() => $xml)
                                .or(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(r => r
                                                .asSlice(r => r
                                                    .oneOrMore(r => r.regExp(/^[^<>]/)),
                                                )
                                            , "text"),
                                        )
                                    , (({ text, range }) => {
                                        return {
                                            value: new __Text(
                                                text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'"),
                                                range()
                                            ),
                                            errors: [],
                                        };
                                    }),
                                    ),
                                )
                            )
                        )
                    , "children")
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
            , (({ tag, attr, children, range }) => {
                return {
                    value: new EL(
                        tag,
                        Object.assign({}, ...attr),
                        children.map(c => c.value ),
                        range(),
                    ),
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
                                            .zeroOrMore(r => r.regExp(/^[^"]/)),
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
            , (({ tag, attr, range }) => {
                return {
                    value: new EL(
                        tag,
                        Object.assign({}, ...attr),
                        [],
                        range(),
                    ),
                    errors: [],
                };
            }),
            ),
        ),
    )
;

export default $xml;
