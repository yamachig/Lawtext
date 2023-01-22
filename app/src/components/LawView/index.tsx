import React, { useCallback, useMemo, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { HTMLLaw } from "lawtext/dist/src/renderer/rules/law";
import { LawtextAppPageStateStruct, OrigSetLawtextAppPageState } from "../LawtextAppPageState";
import { LawData } from "@appsrc/lawdata/common";
import { HTMLOptions, GetFigData } from "lawtext/dist/src/renderer/common/html";
import htmlCSS from "lawtext/dist/src/renderer/rules/htmlCSS";
import { LawViewOptions } from "./common";
import { WrapLawComponent } from "./LawWrapper";
import useAfterMountTasks from "./useAfterMountTask";
import ControlGlobalStyle from "./controls/ControlGlobalStyle";
import parsePath, { PathFragment } from "lawtext/dist/src/path/v1/parse";
import locatePath from "lawtext/dist/src/path/v1/locate";
import { scrollToLawAnchor } from "../../actions/scroll";


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

    const [prevPath, setPrevPath] = useState("");
    React.useEffect(() => {
        if (prevPath !== origState.navigatedPath) {
            if (origState.law) {

                let restPath: PathFragment[] | null = null;

                {
                    const m = /^v1:(.+)$/.exec(origState.navigatedPath);
                    if (m) {
                        const parsedPath = parsePath(m[1]);
                        if (parsedPath.ok && parsedPath.value.length > 1 && parsedPath.value[0].type === "LAW") {
                            restPath = parsedPath.value.slice(1);
                        }
                    } else {
                        const m = /^.+?\/(.+)$/.exec(origState.navigatedPath);
                        if (m) {
                            const parsedPath = parsePath(m[1]);
                            if (parsedPath.ok && parsedPath.value.length >= 1) {
                                restPath = parsedPath.value;
                            }
                        }
                    }
                }

                if (restPath){
                    const located = locatePath(origState.law.analysis.rootContainer, restPath, []);
                    if (located.ok) {
                        scrollToLawAnchor(located.value.container.el.id.toString());
                    } else {
                        console.error(located);
                        if (located.partialValue){
                            scrollToLawAnchor(located.partialValue.container.el.id.toString());
                        }
                    }
                }
            }
            setPrevPath(origState.navigatedPath);
        }
    }, [prevPath, origState.navigatedPath, origState.law]);

    return (
        <LawViewDiv>
            <style>
                {htmlCSS}
            </style>
            <GlobalStyle />
            <ControlGlobalStyle/>
            {origState.hasError && <LawViewError {...props} />}
            {origState.law &&
            // (origState.navigatedPath === props.path) &&
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

    const getFigData = useCallback((src: string) => {
        return lawData.pictURL.get(src) ?? null;
    }, [lawData]) as GetFigData;

    const options: LawViewOptions = useMemo(() => ({
        onError,
        lawData,
        addAfterMountTask,
    }), [onError, lawData, addAfterMountTask]);

    const htmlOptions: HTMLOptions = {
        WrapComponent: WrapLawComponent,
        renderControlEL: true,
        getFigData,
        options,
    };

    return <HTMLLaw
        el={lawData.el}
        indent={0}
        {...{ htmlOptions }}
    />;
};
