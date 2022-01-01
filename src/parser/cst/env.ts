import { stringOffsetToPos, MatchFail, MatchContext, StringPos, BaseEnv } from "generic-parser/lib/core";

export interface Env extends BaseEnv<string, StringPos> {
    state: {
        parenthesesDepth: number;
        maxOffsetMatchFail: MatchFail | null;
        maxOffsetMatchContext: MatchContext | null;
    };
}

export const initialEnv = (options: Record<string | number | symbol, unknown>): Env => {
    const registerCurrentRangeTarget = () => { /**/ };
    const offsetToPos = stringOffsetToPos;

    const state = {
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

