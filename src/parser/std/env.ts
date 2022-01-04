import { MatchFail, MatchContext, BasePos, BaseEnv } from "generic-parser/lib/core";
import { VirtualLine } from "./virtualLine";

export interface Env extends BaseEnv<VirtualLine[], BasePos> {
    state: {
        maxOffsetMatchFail: MatchFail | null;
        maxOffsetMatchContext: MatchContext | null;
    };
    errors: {message: string, range: [start: number, end: number]}[];
    addError: (error: {message: string, range: [start: number, end: number]}) => void;
}

export const initialEnv = (options: Record<string | number | symbol, unknown>): Env => {
    const registerCurrentRangeTarget = () => { /**/ };
    const offsetToPos = (_: VirtualLine[], offset: number) => ({ offset });

    const onMatchFail = (matchFail: MatchFail, matchContext: MatchContext) => {
        if (state.maxOffsetMatchFail === null || matchFail.offset > state.maxOffsetMatchFail.offset) {
            state.maxOffsetMatchFail = matchFail;
            state.maxOffsetMatchContext = matchContext;
        }
    };

    const state = {
        maxOffsetMatchFail: null as null | MatchFail,
        maxOffsetMatchContext: null as null | MatchContext,
    };

    const errors: {message: string, range: [start: number, end: number]}[] = [];
    const addError = (error: {message: string, range: [start: number, end: number]}) => {
        errors.push(error);
    };

    return {
        options,
        toStringOptions: {
            fullToString: true,
            maxToStringDepth: 5,
        },
        registerCurrentRangeTarget,
        offsetToPos,
        onMatchFail,
        state,
        errors,
        addError,
    };
};

