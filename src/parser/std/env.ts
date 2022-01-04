import { MatchFail, MatchContext, BasePos, BaseEnv } from "generic-parser/lib/core";
import { VirtualLine } from "./virtualLine";

export interface Env extends BaseEnv<VirtualLine[], BasePos> {
    state: {
        maxOffsetMatchFail: MatchFail | null;
        maxOffsetMatchContext: MatchContext | null;
    };
}

export const initialEnv = (options: Record<string | number | symbol, unknown>): Env => {
    const registerCurrentRangeTarget = () => { /**/ };
    const offsetToPos = (_: VirtualLine[], offset: number) => ({ offset });

    const state = {
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

