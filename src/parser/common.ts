import { stringOffsetToPos, Rule, Empty, MatchFail, MatchContext } from "generic-parser/lib/core";
import { RuleFactory } from "generic-parser/lib/rules/factory";

type Env = ReturnType<typeof initializer>;
export type ValueRule<TValue> = Rule<string, TValue, Env, Empty>

export const factory = new RuleFactory<string, Env>();

// export const makeMatchFailString = (result: MatchFail, target: string): string => {
//     const { offset, expected, prevFail } = result;
//     const pos = stringOffsetToPos(target, offset);
//     const prevFails: MatchFail[] =
//         prevFail === null ? [] :
//             Array.isArray(prevFail) ? prevFail :
//                 [prevFail];
//     return `${JSON.stringify(pos)}\r\n${expected}\r\n\r\n${prevFails.map(_result => makeMatchFailString(_result, target)).join("\r\n\r\n")}`;
// };

export const makeMatchContextString = (context: MatchContext, target: string): string => {
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initializer = (options: Record<string | number | symbol, unknown>) => {
    const registerCurrentRangeTarget = () => { /**/ };
    const offsetToPos = stringOffsetToPos;

    const state = {
        indentMemo: options.indentMemo as { [key: number]: number },
        baseIndentStack: [] as Array<[number, boolean, number]>,
        listDepth: 0,
        parenthesesDepth: 0,
        maxOffsetMatchFail: null as null | MatchFail,
        maxOffsetMatchContext: null as null | MatchContext,
    };

    const onMatchFail = (matchFail: MatchFail, matchContext: MatchContext) => {
        if (state.maxOffsetMatchFail === null || matchFail.offset > state.maxOffsetMatchFail.offset) {
            state.maxOffsetMatchFail = matchFail;
            state.maxOffsetMatchContext = matchContext;
        }
    };

    return {
        offsetToPos,
        getStack: () => "",
        toStringOptions: {
            fullToString: true,
            maxToStringDepth: 5,
        },
        registerCurrentRangeTarget,
        options,
        state,
        onMatchFail,
    };
};
