import { stringOffsetToPos, Rule, Empty } from "generic-parser/lib/core";
import { RuleFactory } from "generic-parser/lib/rules/factory";

type Env = ReturnType<typeof initializer>;
export type ValueRule<TValue> = Rule<string, TValue, Env, Empty>

export const factory = new RuleFactory<string, Env>();

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
        registerCurrentRangeTarget,
        options,
        state,
    };
};
