import { ValueOfRule } from "generic-parser/lib/core";
import { factory, initializer, ValueRule } from "./common";

import { $law, rules as elementsRules } from "./elements";
import { rules as inlineRules } from "./inline";
import { $NEWLINE, rules as lexicalRules } from "./lexical";
import { rules as rangeRules } from "./range";
import { rules as xmlRules } from "./xml";

const $start = factory
    .sequence(c => c
        .and(r => r
            .zeroOrMore(r => r
                .ref(() => $NEWLINE),
            ),
        )
        .and(r => r
            .ref(() => $law)
        , "law")
        .and(r => r
            .nextIsNot(r => r
                .anyOne(),
            ),
        )
        .action((({ law }) => {
            return law;
        })),
    );


const rules = {
    start: $start,
    ...elementsRules,
    ...inlineRules,
    ...lexicalRules,
    ...rangeRules,
    ...xmlRules,
};
    type Rules = typeof rules;

export const parse = <TRuleKey extends (keyof Rules) = "start">(text: string, options: {startRule?: TRuleKey} & Record<string | number | symbol, unknown>): ValueOfRule<Rules[TRuleKey]> => {
    let rule: ValueRule<unknown> = $start;
    if ("startRule" in options) {
        rule = rules[options.startRule as keyof typeof rules];
    }
    const result = rule.match(
        0,
        text,
        initializer(options),
    );
    if (result.ok) return result.value as ValueOfRule<Rules[TRuleKey]>;
    throw new Error(`Expected ${result.expected} ${JSON.stringify(result)}`);
};
