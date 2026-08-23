import factory from "../factory.ts";
import type { WithErrorRule } from "../util.ts";

export const $indents: WithErrorRule<{indentTexts: string[], indentDepth: number}> = factory
    .withName("indent")
    .sequence(s => s
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r.zeroOrMore(r => r.regExp(/^(?: {2}|　|\t)/)), "indentTexts")
        .action(({ indentTexts }) => {
            return {
                value: {
                    indentTexts,
                    indentDepth: indentTexts.length,
                },
                errors: [],
            };
        })
    )
    ;

export default $indents;

