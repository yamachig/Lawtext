import factory from "../factory";

export const $indents = factory
    .withName("indent")
    .sequence(s => s
        // eslint-disable-next-line no-irregular-whitespace
        .and(r => r.zeroOrMore(r => r.regExp(/^(?: {2}|　|\t)/)), "indentTexts")
        .action(({ indentTexts }) => ({
            indentTexts,
            indentDepth: indentTexts.length,
        }))
    )
    ;

export default $indents;

