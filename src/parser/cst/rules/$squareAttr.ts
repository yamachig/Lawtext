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
            .action(({ name, value, text, range }) => {
                const r = range();
                return {
                    value: new AttrEntry(
                        text(),
                        [name, value],
                        r,
                        "",
                        [r[1], r[1]],
                    ),
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
