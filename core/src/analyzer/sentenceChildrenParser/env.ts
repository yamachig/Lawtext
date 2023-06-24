import { MatchFail, MatchContext, BasePos, BaseEnv } from "generic-parser/lib/core";
import { SentenceChildEL } from "../../node/cst/inline";

export interface Env extends BaseEnv<SentenceChildEL[], BasePos> {
    state: {
        maxOffsetMatchFail: MatchFail | null;
        maxOffsetMatchContext: MatchContext | null;
    };
}

export interface InitialEnvOptions {
    target: string,
    options?: Record<string | number | symbol, unknown>,
    baseOffset?: number,
}

export const initialEnv = (initialEnvOptions: InitialEnvOptions): Env => {
    const { options = {}, baseOffset = 0 } = initialEnvOptions;
    const registerCurrentRangeTarget = () => { /**/ };
    const offsetToPos = (_: SentenceChildEL[], offset: number) => ({ offset });

    const state = {
        maxOffsetMatchFail: null as null | MatchFail,
        maxOffsetMatchContext: null as null | MatchContext,
    };

    return {
        options,
        registerCurrentRangeTarget,
        offsetToPos,
        state,
        baseOffset,
    };
};

