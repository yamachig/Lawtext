import { MatchFail, MatchContext, BasePos, BaseEnv, getMemorizedStringOffsetToPos, StringPos } from "generic-parser/lib/core";
import { ErrorMessage } from "../cst/error";
import { VirtualLine } from "./virtualLine";

export interface Env extends BaseEnv<VirtualLine[], BasePos> {
    state: {
        maxOffsetMatchFail: MatchFail | null;
        maxOffsetMatchContext: MatchContext | null;
    };
    newErrorMessage: (message: string, range: [start: number, end: number]) => ErrorMessage;
    stringOffsetToPos: (target: string, offset: number) => StringPos;
}

export interface InitialEnvOptions {
    target: string,
    options?: Record<string | number | symbol, unknown>,
    baseOffset?: number,
}

export const initialEnv = (initialEnvOptions: InitialEnvOptions): Env => {
    const { target, options = {}, baseOffset = 0 } = initialEnvOptions;
    const registerCurrentRangeTarget = () => { /**/ };
    const offsetToPos = (_: VirtualLine[], offset: number) => ({ offset });
    const stringOffsetToPos = getMemorizedStringOffsetToPos();

    // const onMatchFail = (matchFail: MatchFail, matchContext: MatchContext) => {
    //     if (state.maxOffsetMatchFail === null || matchFail.offset > state.maxOffsetMatchFail.offset) {
    //         state.maxOffsetMatchFail = matchFail;
    //         state.maxOffsetMatchContext = matchContext;
    //     }
    // };

    const newErrorMessage = (message: string, range: [start:number, end:number]) =>
        new ErrorMessage(
            message,
            [
                stringOffsetToPos(target, range[0]),
                stringOffsetToPos(target, range[1]),
            ]
        );

    const state = {
        maxOffsetMatchFail: null as null | MatchFail,
        maxOffsetMatchContext: null as null | MatchContext,
    };

    return {
        options,
        // toStringOptions: {
        //     fullToString: true,
        //     maxToStringDepth: 5,
        // },
        registerCurrentRangeTarget,
        offsetToPos,
        // onMatchFail,
        state,
        newErrorMessage,
        stringOffsetToPos,
        baseOffset,
    };
};

