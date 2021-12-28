import * as std from "../std_law";
import { ValueOfRule, ParseError as _ParseError } from "generic-parser/lib/core";
import { StringPos } from "generic-parser";
import { factory, initializer, makeMatchFailString, ValueRule } from "./common";
import { rules as inlineRules } from "./inline";
import { $NEWLINE, rules as lexicalRules } from "./lexical";
import { rules as rangeRules } from "./range";
import { rules as xmlRules } from "./xml";
import { $law } from "./std/law";

import * as law from "./std/law";
import * as toc from "./std/toc";
import * as articleGroup from "./std/articleGroup";
import * as article from "./std/article";
import * as supplNote from "./std/supplNote";
import * as paragraphItem from "./std/paragraphItem";
import * as list from "./std/list";
import * as columnsOrSentences from "./std/columnsOrSentences";
import * as amendProvision from "./std/amendProvision";
import * as tableStruct from "./std/tableStruct";
import * as styleStruct from "./std/styleStruct";
import * as formatStruct from "./std/formatStruct";
import * as noteStruct from "./std/noteStruct";
import * as remarks from "./std/remarks";
import * as figStruct from "./std/figStruct";
import * as supplProvisionAppdxTable from "./std/supplProvisionAppdxTable";
import * as appdxStyle from "./std/appdxStyle";
import * as supplProvisionAppdxStyle from "./std/supplProvisionAppdxStyle";
import * as appdxFormat from "./std/appdxFormat";
import * as appdxFig from "./std/appdxFig";
import * as appdxNote from "./std/appdxNote";
import * as appdxTable from "./std/appdxTable";
import * as appdx from "./std/appdx";
import * as supplProvisionAppdx from "./std/supplProvisionAppdx";
import * as supplProvision from "./std/supplProvision";

const $start: ValueRule<std.Law> = factory
    .sequence(c => c
        .and(r => r
            .zeroOrMore(() => $NEWLINE),
        )
        .and(() => $law, "law")
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

export const parse = <TRuleKey extends (keyof Rules) = "start">(target: string, options: {startRule?: TRuleKey} & Record<string | number | symbol, unknown>): ValueOfRule<Rules[TRuleKey]> => {
    let rule: ValueRule<unknown> = $start;
    if ("startRule" in options) {
        rule = rules[options.startRule as keyof typeof rules];
    }
    const env = initializer(options);
    const result = rule.match(
        0,
        target,
        env,
    );
    if (result.ok) return result.value as ValueOfRule<Rules[TRuleKey]>;
    throw new Error(`Expected:\r\n\r\n${makeMatchFailString(result, target)}`);
};
