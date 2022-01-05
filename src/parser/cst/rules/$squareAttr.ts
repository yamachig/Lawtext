import { AttrEntry } from "../../../node/cst/inline";
import { factory } from "../factory";
import { ValueRule, WithErrorRule } from "../util";

export const makeSquareAttrRule = (lazyNameRule: (f: typeof factory) => ValueRule<string>): WithErrorRule<AttrEntry> => {
    return factory
        .withName("squareAttr")
        .sequence(c => c
            .and(r => r.seqEqual("["))
            .and(lazyNameRule, "name")
            .and(r => r.seqEqual("=\""))
            .and(r => r
                .asSlice(r => r
                    // eslint-disable-next-line no-irregular-whitespace
                    .oneOrMore(r => r.regExp(/^[^ 　\t\r\n\]"]/))
                )
            , "value")
            .and(r => r.seqEqual("\"]"))
            .action(({ name, value, text }) => {
                return {
                    value: {
                        text: text(),
                        entry: [name, value],
                        trailingSpace: "",
                    } as AttrEntry,
                    errors: [],
                };
            })
        );
};

export const $squareAttr = makeSquareAttrRule(r => r
    .asSlice(r => r
        .oneOrMore(r => r
            // eslint-disable-next-line no-irregular-whitespace
            .regExp(/^[^ 　\t\r\n\]=]/),
        ),
    ),
);

export default $squareAttr;
