import { getMemorizedStringOffsetToPos, MatchFail, MatchContext, StringPos, BaseEnv } from "generic-parser/lib/core";

export interface Env extends BaseEnv<string, StringPos> {
    currentIndentDepth: number;
    state: {
        parenthesesDepth: number;
        maxOffsetMatchFail: MatchFail | null;
        maxOffsetMatchContext: MatchContext | null;
    };
}

export interface InitialEnvOptions {
    options?: Record<string | number | symbol, unknown>,
    baseOffset?: number,
}

export const initialEnv = (initialEnvOptions: InitialEnvOptions): Env => {
    const { options = {}, baseOffset = 0 } = initialEnvOptions;
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
        options,
        state,
        baseOffset,
    };
};

