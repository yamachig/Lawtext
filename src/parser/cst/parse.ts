import { stringOffsetToPos } from "generic-parser";
import { MatchContext } from "generic-parser/lib/core";
import { initialEnv } from "./env";
import $lines from "./rules/$lines";

const makeMatchContextString = (context: MatchContext, target: string): string => {
    const { offset, ruleToString, prevContext } = context;
    const expected = ruleToString();
    const newLineOffsetBefore = target.lastIndexOf("\n", offset);
    const newLineOffsetAfter = target.slice(offset).search(/\r?\n/);
    // eslint-disable-next-line no-irregular-whitespace
    const subString = (target.slice(newLineOffsetBefore + 1, offset) + "▸" + target.slice(offset, offset + newLineOffsetAfter)).replace(/ /g, "･").replace(/　/g, "⬚");
    const pos = stringOffsetToPos(target, offset);
    return `Location: ${JSON.stringify(pos)}
Expected: ${expected}
${subString}

${prevContext ? makeMatchContextString(prevContext, target) : ""}`;
};

export const parse = (
    lawtext: string,
    options: Record<string | number | symbol, unknown> = {},
) => {

    const env = initialEnv(options);

    const target = lawtext.endsWith("\n") ? lawtext : lawtext + "\r\n";

    const result = $lines.match(
        0,
        target,
        env,
    );

    if (result.ok) return result.value;

    throw new Error(`Parse error:
MatchFail at max offset:

${env.state.maxOffsetMatchContext && makeMatchContextString(env.state.maxOffsetMatchContext, target)}
`);
};

export default parse;
