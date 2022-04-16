import React, { useCallback, useMemo } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { HTMLLaw } from "lawtext/dist/src/renderer/rules/law";
import { LawtextAppPageStateStruct, OrigSetLawtextAppPageState } from "./LawtextAppPageState";
import { LawData } from "@appsrc/lawdata/common";
import { HTMLOptions } from "lawtext/dist/src/renderer/rules/html";
import htmlCSS from "lawtext/dist/src/renderer/rules/htmlCSS";
import { ControlGlobalStyle } from "./ControlRun";
import { LawViewOptions } from "./common";
import { WrapLawComponent, useAfterMountTasks } from "./LawWrapper";


const GlobalStyle = createGlobalStyle`
`;

const LawViewDiv = styled.div`
    padding: 2rem 3rem 10rem 3rem;
`;

export const LawView: React.FC<LawtextAppPageStateStruct> = props => {
    const { origState, origSetState } = props;

    const onError = useCallback((error: Error) => {
        origSetState(prev => ({ ...prev, hasError: true, errors: [...prev.errors, error] }));
    }, [origSetState]);

    const MemoLawDataComponent = React.useMemo(() => React.memo(LawDataComponent), []);

    return (
        <LawViewDiv>
            <style>
                {htmlCSS}
            </style>
            <GlobalStyle />
            <ControlGlobalStyle/>
            {origState.hasError && <LawViewError {...props} />}
            {origState.law &&
                (origState.navigatedLawSearchKey === props.lawSearchKey) &&
                    <MemoLawDataComponent lawData={origState.law} onError={onError} origSetState={origSetState} />
            }
        </LawViewDiv>
    );
};

const LawViewErrorDiv = styled.div`
`;

const LawViewError: React.FC<LawtextAppPageStateStruct> = props => {
    const { origState } = props;
    return (
        <LawViewErrorDiv className="alert alert-danger">
            レンダリング時に{origState.errors.length}個のエラーが発生しました
        </LawViewErrorDiv>
    );
};

const LawDataComponent: React.FC<{
    lawData: LawData,
    onError: (error: Error) => unknown,
    origSetState: OrigSetLawtextAppPageState,
}> = props => {
    const { lawData, onError, origSetState } = props;

    const { addAfterMountTask } = useAfterMountTasks(origSetState);

    const options: LawViewOptions = useMemo(() => ({
        onError,
        lawData,
        addAfterMountTask,
    }), [onError, lawData, addAfterMountTask]);

    const htmlOptions: HTMLOptions = {
        WrapComponent: WrapLawComponent,
        options,
    };

    return <HTMLLaw
        el={lawData.el}
        indent={0}
        {...{ htmlOptions }}
    />;
};
