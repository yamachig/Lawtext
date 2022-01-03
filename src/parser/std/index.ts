import * as std from "../../law/std";
import { ValueOfRule, ParseError as _ParseError } from "generic-parser/lib/core";
import { StringPos } from "generic-parser";
import { factory, initializer, makeMatchContextString, ValueRule } from "./common";
import { rules as inlineRules } from "../cst/rules/inline";
import { $NEWLINE, rules as lexicalRules } from "../cst/rules/lexical";
import { rules as rangeRules } from "./range";
import { rules as xmlRules } from "../cst/rules/xml";
import { lex } from "./lex";

import * as law from "./rules/law";
import * as toc from "./rules/toc";
import * as articleGroup from "./rules/articleGroup";
import * as article from "./rules/article";
import * as supplNote from "./rules/supplNote";
import * as paragraphItem from "./rules/paragraphItem";
import * as list from "./rules/list";
import * as columnsOrSentences from "./rules/columnsOrSentences";
import * as amendProvision from "./rules/amendProvision";
import * as tableStruct from "./rules/tableStruct";
import * as styleStruct from "./rules/styleStruct";
import * as formatStruct from "./rules/formatStruct";
import * as noteStruct from "./rules/noteStruct";
import * as remarks from "./rules/remarks";
import * as figStruct from "./rules/figStruct";
import * as supplProvisionAppdxTable from "./rules/supplProvisionAppdxTable";
import * as appdxStyle from "./rules/appdxStyle";
import * as supplProvisionAppdxStyle from "./rules/supplProvisionAppdxStyle";
import * as appdxFormat from "./rules/appdxFormat";
import * as appdxFig from "./rules/appdxFig";
import * as appdxNote from "./rules/appdxNote";
import * as appdxTable from "./rules/appdxTable";
import * as appdx from "./rules/appdx";
import * as supplProvisionAppdx from "./rules/supplProvisionAppdx";
import * as supplProvision from "./rules/supplProvision";

const $start: ValueRule<std.Law> = factory
    .sequence(c => c
        .and(r => r
            .zeroOrMore(() => $NEWLINE),
        )
        .and(() => law.$law, "law")
        .and(r => r
            .nextIsNot(r => r.anyOne()),
        )
        .action((({ law }) => {
            return law;
        })),
    );


const rules = {
    start: $start,
    ...inlineRules,
    ...lexicalRules,
    ...rangeRules,
    ...xmlRules,
    ...law.rules,
    ...toc.rules,
    ...articleGroup.rules,
    ...article.rules,
    ...supplNote.rules,
    ...paragraphItem.rules,
    ...list.rules,
    ...columnsOrSentences.rules,
    ...amendProvision.rules,
    ...tableStruct.rules,
    ...styleStruct.rules,
    ...formatStruct.rules,
    ...noteStruct.rules,
    ...remarks.rules,
    ...figStruct.rules,
    ...supplProvisionAppdxTable.rules,
    ...appdxStyle.rules,
    ...supplProvisionAppdxStyle.rules,
    ...appdxFormat.rules,
    ...appdxFig.rules,
    ...appdxNote.rules,
    ...appdx.rules,
    ...supplProvisionAppdx.rules,
    ...supplProvision.rules,
    ...appdxTable.rules,
};
    type Rules = typeof rules;

export type ParseError = _ParseError<StringPos>;

export const parse = <TRuleKey extends (keyof Rules) = "start">(
    lawtext: string,
    options: {startRule?: TRuleKey} & Record<string | number | symbol, unknown> = {},
): ValueOfRule<Rules[TRuleKey]> => {

    const [lexed, indentMemo /**/] = lex(lawtext);

    let rule: ValueRule<unknown> = $start;
    if ("startRule" in options) {
        rule = rules[options.startRule as keyof typeof rules] as unknown as ValueRule<unknown>;
    }

    const env = initializer({
        ...options,
        indentMemo,
    });

    const result = rule.match(
        0,
        lexed,
        env,
    );

    if (result.ok) return result.value as ValueOfRule<Rules[TRuleKey]>;

    throw new Error(`Parse error:
MatchFail at max offset:

${env.state.maxOffsetMatchContext && makeMatchContextString(env.state.maxOffsetMatchContext, lexed)}
`);
};
