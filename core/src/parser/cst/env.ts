import type { MatchFail, MatchContext, StringPos, BaseEnv } from "generic-parser/lib/core/index.js";
import { getMemorizedStringOffsetToPos } from "generic-parser/lib/core/index.js";
import type { WithErrorRule } from "./util.ts";
import type { SentenceChildEL } from "../../node/cst/inline.ts";
import { makeReOutsideParenthesesTextChars, makeReParenthesesInlineTextChars, makeRePeriodSentenceTextChars } from "./rules/$sentenceChildren.ts";

export interface Env extends BaseEnv<string, StringPos> {
    currentIndentDepth: number;
    state: {
        parenthesesDepth: number;
        maxOffsetMatchFail: MatchFail | null;
        maxOffsetMatchContext: MatchContext | null;
    };
    options: Record<string | number | symbol, unknown> & Partial<{
        reParenthesesInlineTextChars: RegExp,
        reOutsideParenthesesTextChars: RegExp,
        rePeriodSentenceTextChars: RegExp,
        inlineTokenRule: WithErrorRule<SentenceChildEL>,
    }>,
}

export interface InitialEnvOptions {
    options?: Env["options"],
    baseOffset?: number,
}

export const initialEnv = (initialEnvOptions: InitialEnvOptions): Env => {
    const { options, baseOffset = 0 } = initialEnvOptions;
    const offsetToPos = getMemorizedStringOffsetToPos();

    const state = {
        parenthesesDepth: 0,
        maxOffsetMatchFail: null as null | MatchFail,
        maxOffsetMatchContext: null as null | MatchContext,
    };

    return {
        currentIndentDepth: 0,
        offsetToPos,
        registerCurrentRangeTarget: () => { /**/ },
        options: {
            reParenthesesInlineTextChars: makeReParenthesesInlineTextChars(""),
            reOutsideParenthesesTextChars: makeReOutsideParenthesesTextChars(""),
            rePeriodSentenceTextChars: makeRePeriodSentenceTextChars(""),
            ...options,
        },
        state,
        baseOffset,
    };
};

