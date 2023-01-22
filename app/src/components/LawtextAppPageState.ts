import React from "react";
import { LawData } from "@appsrc/lawdata/common";
import { useNavigate, useParams } from "react-router-dom";

export interface BaseLawtextAppPageState {
    law: LawData | null;
    loadingLaw: boolean;
    viewerMessages: Record<string, string>;
    hasError: boolean;
    errors: Error[];
    navigatedPath: string;
}

const getInitialState = (): BaseLawtextAppPageState => ({
    law: null,
    loadingLaw: false,
    viewerMessages: {},
    hasError: false,
    errors: [],
    navigatedPath: "",
});
export type SetLawtextAppPageState = (newState: Partial<BaseLawtextAppPageState>) => void;
export type OrigSetLawtextAppPageState = React.Dispatch<React.SetStateAction<BaseLawtextAppPageState>>;

export interface LawtextAppPageStateStruct {
    origState: Readonly<BaseLawtextAppPageState>,
    origSetState: OrigSetLawtextAppPageState,
    setState: SetLawtextAppPageState,
    navigate: ReturnType<typeof useNavigate>,
    path: string,
}
interface RouteParams {
    "*": string | undefined,
    [key: string]: string | undefined,
}

export const useLawtextAppPageState = (): LawtextAppPageStateStruct => {

    const { "*": path } = useParams<RouteParams>();

    const [state, origSetState] = React.useState<BaseLawtextAppPageState>(getInitialState);

    const setState = React.useCallback(
        (newState: Partial<BaseLawtextAppPageState>) => {
            origSetState(prevState => ({ ...prevState, ...newState }));
        },
        [origSetState],
    );
    const navigate = useNavigate();

    return {
        origState: state,
        origSetState,
        setState,
        navigate,
        path: path ?? "",
    };
};
