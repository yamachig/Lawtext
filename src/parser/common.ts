import { stringOffsetToPos, Rule, Empty, MatchFail } from "generic-parser/lib/core";
import { RuleFactory } from "generic-parser/lib/rules/factory";

type Env = ReturnType<typeof initializer>;
export type ValueRule<TValue> = Rule<string, TValue, Env, Empty>

export const factory = new RuleFactory<string, Env>();

export const makeMatchFailString = (result: MatchFail, target: string): string => {
    const { offset, expected, prevFail } = result;
    const pos = stringOffsetToPos(target, offset);
    const prevFails: MatchFail[] =
        prevFail === null ? [] :
            Array.isArray(prevFail) ? prevFail :
                [prevFail];
    return `${JSON.stringify(pos)}\r\n${expected}\r\n\r\n${prevFails.map(_result => makeMatchFailString(_result, target)).join("\r\n\r\n")}`;
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
    };
};
