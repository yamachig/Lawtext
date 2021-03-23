import React, { useEffect } from "react";
import * as std from "@coresrc/std_law";
import * as analyzer from "@coresrc/analyzer";

export interface BaseLawtextAppPageState {
    law: std.Law | null;
    loadingLaw: boolean;
    loadingLawMessage: string;
    lawSearchedKey: string;
    analysis: analyzer.Analysis | null;
    hasError: boolean;
    errors: Error[];
}

const initialState: BaseLawtextAppPageState = {
    law: null,
    loadingLaw: false,
    loadingLawMessage: "",
    lawSearchedKey: "",
    analysis: null,
    hasError: false,
    errors: [],
};

export type LawtextAppPageState = BaseLawtextAppPageState & {
    lawSearchKey: string;
}

export type SetLawtextAppPageState = (newState: Partial<LawtextAppPageState>) => void;

export interface LawtextAppPageStateStruct {
    origState: Readonly<LawtextAppPageState>,
    origSetState: React.Dispatch<React.SetStateAction<LawtextAppPageState>>,
    setState: SetLawtextAppPageState,
}

export interface OrigStateProps {
    origState: Readonly<LawtextAppPageState>,
}

export const useLawtextAppPageState = (lawSearchKey: string): LawtextAppPageStateStruct => {
    const [state, origSetState] = React.useState<LawtextAppPageState>({
        ...initialState,
        lawSearchKey,
    });

    const setState = React.useCallback(
        (newState: Partial<BaseLawtextAppPageState>) => {
            origSetState(prevState => ({ ...prevState, ...newState }));
        },
        [origSetState],
    );

    useEffect(() => {
        origSetState(prevState => ({ ...prevState, lawSearchKey }));
    }, [lawSearchKey]);

    return {
        origState: state,
        origSetState,
        setState,
    };
};
