import type { MatchFail, MatchContext, BasePos, BaseEnv } from "generic-parser/lib/core";
import type { VirtualLine } from "./virtualLine";

export interface Env extends BaseEnv<VirtualLine[], BasePos> {
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
    const offsetToPos = (_: VirtualLine[], offset: number) => ({ offset });

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
        baseOffset,
    };
};

