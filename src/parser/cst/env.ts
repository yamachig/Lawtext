import { getMemorizedStringOffsetToPos, MatchFail, MatchContext, StringPos, BaseEnv } from "generic-parser/lib/core";
import { ErrorMessage } from "./error";

export interface Env extends BaseEnv<string, StringPos> {
    currentIndentDepth: number;
    state: {
        parenthesesDepth: number;
        maxOffsetMatchFail: MatchFail | null;
        maxOffsetMatchContext: MatchContext | null;
    };
    newErrorMessage: (message: string, range: [start: number, end: number]) => ErrorMessage;
}

export interface InitialEnvOptions {
    options?: Record<string | number | symbol, unknown>,
    baseOffset?: number,
}

export const initialEnv = (initialEnvOptions: InitialEnvOptions): Env => {
    const { options = {}, baseOffset = 0 } = initialEnvOptions;
    let target = "";
    const registerCurrentRangeTarget = (start: number, end: number, _target: string) => {
        void start;
        void end;
        target = _target;
    };
    const offsetToPos = getMemorizedStringOffsetToPos();

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

    const newErrorMessage = (message: string, range: [start:number, end:number]) =>
        new ErrorMessage(
            message,
            [
                offsetToPos(target, range[0]),
                offsetToPos(target, range[1]),
            ]
        );

    return {
        currentIndentDepth: 0,
        offsetToPos,
        toStringOptions: {
            fullToString: true,
            maxToStringDepth: 5,
        },
        registerCurrentRangeTarget,
        options,
        state,
        onMatchFail,
        newErrorMessage,
        baseOffset,
    };
};

