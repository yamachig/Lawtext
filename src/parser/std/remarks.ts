/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "../../std_law";
import { __Text } from "../../node/control";
import { setItemNum } from "../../lawUtil";
import { factory, ValueRule } from "../common";
import { $INLINE } from "../inline";
import { $DEDENT, $INDENT, $NEWLINE, $__ } from "../lexical";
import { $no_name_paragraph_item, $paragraph_item } from "./paragraphItem";


export const $remarks = factory
    .withName("remarks")
    .action(r => r
        .sequence(c => c
            .and(r => r
                .action(r => r
                    .sequence(c => c
                        .and(r => r
                            .zeroOrMore(r => r
                                .action(r => r
                                    .sequence(c => c
                                        .and(r => r.seqEqual("["))
                                        .and(r => r
                                            .asSlice(r => r
                                                .oneOrMore(r => r.regExp(/^[^ 　\t\r\n\]=]/)),
                                            )
                                        , "name")
                                        .and(r => r.seqEqual("=\""))
                                        .and(r => r
                                            .asSlice(r => r
                                                .oneOrMore(r => r.regExp(/^[^ 　\t\r\n\]"]/)),
                                            )
                                        , "value")
                                        .and(r => r.seqEqual("\"]")),
                                    )
                                , (({ name, value }) => {
                                    return [name, value];
                                }),
                                ),
                            )
                        , "target"),
                    )
                , (({ target }) => {
                    const ret = {} as Record<string, string>;
                    for (const [name, value] of target) {
                        ret[name] = value;
                    }
                    return ret;
                }),
                )
            , "label_attr")
            .and(r => r
                .choice(c => c
                    .or(r => r
                        .action(r => r
                            .sequence(c => c
                                .and(r => r.seqEqual(":remarks:"))
                                .and(r => r
                                    .zeroOrMore(r => r.regExp(/^[^ 　\t\r\n]/)),
                                ),
                            )
                        , (() => {
                            return "";
                        }),
                        ),
                    )
                    .or(r => r
                        .asSlice(r => r
                            .sequence(c => c
                                .and(r => r
                                    .choice(c => c
                                        .or(r => r.seqEqual("備考"))
                                        .or(r => r.seqEqual("注"))
                                        .or(r => r.seqEqual("※")),
                                    ),
                                )
                                .and(r => r
                                    .zeroOrMore(r => r.regExp(/^[^ 　\t\r\n]/)),
                                ),
                            ),
                        ),
                    ),
                )
            , "label")
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(() => $__)
                            .and(() => $INLINE, "_target"),
                        )
                    , (({ _target }) => {
                        return newStdEL(
                            "Sentence",
                            {},
                            _target,
                        );
                    }),
                    ),
                )
            , "first")
            .and(() => $NEWLINE)
            .and(r => r
                .zeroOrOne(r => r
                    .choice(c => c
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(() => $INDENT)
                                    .and(() => $INDENT)
                                    .and(r => r
                                        .oneOrMore(r => r
                                            .choice(c => c
                                                .or(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(r => r
                                                                .assert(({ first }) => {
                                                                    return !first;
                                                                }),
                                                            )
                                                            .and(r => r
                                                                .nextIs(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r.seqEqual(""))
                                                                        .and(r => r
                                                                            .assert(({ state, location }) => {
                                                                                state.baseIndentStack.push([state.indentMemo[location().start.line] - 1, false, location().start.line]); return true;
                                                                            }),
                                                                        ),
                                                                    ),
                                                                ),
                                                            )
                                                            .and(r => r
                                                                .choice(c => c
                                                                    .or(() => $paragraph_item)
                                                                    .or(() => $no_name_paragraph_item),
                                                                )
                                                            , "_target")
                                                            .and(r => r
                                                                .nextIs(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r.seqEqual(""))
                                                                        .and(r => r
                                                                            .assert(({ state }) => {
                                                                                state.baseIndentStack.pop(); return true;
                                                                            }),
                                                                        ),
                                                                    ),
                                                                ),
                                                            ),
                                                        )
                                                    , (({ _target }) => {
                                                        return _target;
                                                    }),
                                                    ),
                                                )
                                                .or(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .nextIs(r => r
                                                                .sequence(c => c
                                                                    .and(r => r.seqEqual(""))
                                                                    .and(r => r
                                                                        .assert(({ state }) => {
                                                                            state.baseIndentStack.pop(); return false;
                                                                        }),
                                                                    ),
                                                                ),
                                                            ),
                                                        )
                                                        .and(r => r.seqEqual("DUMMY")),
                                                    ) as unknown as ValueRule<never>,
                                                )
                                                .or(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(() => $INLINE, "_target")
                                                            .and(() => $NEWLINE),
                                                        )
                                                    , (({ _target }) => {
                                                        return newStdEL(
                                                            "Sentence",
                                                            {},
                                                            _target,
                                                        );
                                                    }),
                                                    ),
                                                ),
                                            ),
                                        )
                                    , "target")
                                    .and(r => r.zeroOrMore(() => $NEWLINE))
                                    .and(() => $DEDENT)
                                    .and(() => $DEDENT),
                                )
                            , (({ target }) => {
                                return target;
                            }),
                            ),
                        )
                        .or(r => r
                            .action(r => r
                                .sequence(c => c
                                    .and(() => $INDENT)
                                    .and(() => $INDENT)
                                    .and(() => $INDENT)
                                    .and(() => $INDENT)
                                    .and(r => r
                                        .oneOrMore(r => r
                                            .choice(c => c
                                                .or(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(r => r
                                                                .assert(({ first }) => {
                                                                    return !first;
                                                                }),
                                                            )
                                                            .and(r => r
                                                                .nextIs(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r.seqEqual(""))
                                                                        .and(r => r
                                                                            .assert(({ state, location }) => {
                                                                                state.baseIndentStack.push([state.indentMemo[location().start.line] - 1, false, location().start.line]); return true;
                                                                            }),
                                                                        ),
                                                                    ),
                                                                ),
                                                            )
                                                            .and(r => r
                                                                .choice(c => c
                                                                    .or(() => $paragraph_item)
                                                                    .or(() => $no_name_paragraph_item),
                                                                )
                                                            , "_target")
                                                            .and(r => r
                                                                .nextIs(r => r
                                                                    .sequence(c => c
                                                                        .and(r => r.seqEqual(""))
                                                                        .and(r => r
                                                                            .assert(({ state }) => {
                                                                                state.baseIndentStack.pop(); return true;
                                                                            }),
                                                                        ),
                                                                    ),
                                                                ),
                                                            ),
                                                        )
                                                    , (({ _target }) => {
                                                        return _target;
                                                    }),
                                                    ),
                                                )
                                                .or(r => r
                                                    .sequence(c => c
                                                        .and(r => r
                                                            .nextIs(r => r
                                                                .sequence(c => c
                                                                    .and(r => r.seqEqual(""))
                                                                    .and(r => r
                                                                        .assert(({ state }) => {
                                                                            state.baseIndentStack.pop(); return false;
                                                                        }),
                                                                    ),
                                                                ),
                                                            ),
                                                        )
                                                        .and(r => r.seqEqual("DUMMY")),
                                                    ) as unknown as ValueRule<never>,
                                                )
                                                .or(r => r
                                                    .action(r => r
                                                        .sequence(c => c
                                                            .and(() => $INLINE, "_target")
                                                            .and(() => $NEWLINE),
                                                        )
                                                    , (({ _target }) => {
                                                        return newStdEL(
                                                            "Sentence",
                                                            {},
                                                            _target,
                                                        );
                                                    }),
                                                    ),
                                                ),
                                            ),
                                        )
                                    , "target")
                                    .and(r => r.zeroOrMore(() => $NEWLINE))
                                    .and(() => $DEDENT)
                                    .and(() => $DEDENT)
                                    .and(() => $DEDENT)
                                    .and(() => $DEDENT),
                                )
                            , (({ target }) => {
                                return target;
                            }),
                            ),
                        ),
                    ),
                )
            , "rest")
            .and(r => r
                .assert(({ first, rest }) => {
                    return first || (rest && rest.length);
                }),
            ),
        )
    , (({ label_attr, label, first, rest }) => {
        const children = [...(first ? [first] : []), ...(rest ?? [])];
        if (children.length >= 2) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.tag.match(/Sentence|Column/)) {
                    child.attr.Num = "" + (i + 1);
                }
            }
        }

        const remarks = newStdEL("Remarks");
        remarks.append(newStdEL("RemarksLabel", label_attr, [new __Text(label)]));
        if (children) {
            setItemNum(children);
        }
        remarks.extend(children);

        return remarks;
    }),
    )
    ;


export const rules = {
    remarks: $remarks,
};
