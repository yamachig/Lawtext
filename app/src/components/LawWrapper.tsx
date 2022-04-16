import React, { } from "react";
import styled from "styled-components";
import { omit } from "lawtext/dist/src/util";
import { OrigSetLawtextAppPageState } from "./LawtextAppPageState";
import { ErrorCatcher } from "./ErrorCatcher";
import { HTMLComponentProps, WrapperComponentProps } from "lawtext/dist/src/renderer/rules/html";
import { LawViewOptions } from "./common";
import { useObserved } from "./useObserved";
import { WrapHTMLControlRun } from "./ControlRun";
import { EL } from "lawtext/dist/src/node/el";
import * as std from "lawtext/dist/src/law/std";


export const useAfterMountTasks = (origSetState: OrigSetLawtextAppPageState) => {
    const status = React.useMemo(() => ({
        tasks: [] as (() => unknown)[],
        doneCount: 0,
        started: null as Date | null,
    }), []);

    const addAfterMountTask = React.useCallback((func: () => unknown) => {
        status.tasks.push(func);
    }, [status]);

    const checkTaskTimer = React.useRef<NodeJS.Timer>();

    const checkTaskInner = React.useCallback(() => {

        const tasks = status.tasks.splice(0, 512);

        if (tasks.length === 0) {
            checkTaskTimer.current = setTimeout(checkTaskInner, 3000);
            return;
        }

        if (!status.started) {
            console.log("useAfterMountTasks started");
            status.started = new Date();
            status.doneCount = 0;

            origSetState(s => ({
                ...s,
                viewerMessages: {
                    ...s.viewerMessages,
                    afterMountTasks: "追加のレンダリングを行っています (0%)...",
                },
            }));
        }

        for (const task of tasks) {
            task();
            status.doneCount++;
        }

        if (status.tasks.length > 0) {
            origSetState(s => ({
                ...s,
                viewerMessages: {
                    ...s.viewerMessages,
                    afterMountTasks: `追加のレンダリングを行っています (${Math.ceil(status.doneCount / (status.doneCount + status.tasks.length) * 100)}%)...`,
                },
            }));
        } else {
            origSetState(s => ({
                ...s,
                viewerMessages: omit(s.viewerMessages, "afterMountTasks"),
            }));
        }

        if (status.tasks.length === 0 && status.started) {
            console.log(`useAfterMountTasks finished: ${status.doneCount} items in ${new Date().getTime() - status.started.getTime()} ms`);
            status.started = null;
        }

        checkTaskTimer.current = setTimeout(checkTaskInner, 1);

    }, [origSetState, status]);

    React.useEffect(() => {
        checkTaskTimer.current = setTimeout(checkTaskInner, 300);
        return () => {
            if (checkTaskTimer.current) clearTimeout(checkTaskTimer.current);
        };
    }, [checkTaskInner]);

    return {
        addAfterMountTask,
    };
};


const ErrorComponentDiv = styled.div`
`;

class LawErrorCatcher extends ErrorCatcher {
    protected override renderError(): JSX.Element | JSX.Element[] | null | undefined {
        return (
            <ErrorComponentDiv className="alert alert-danger">
                レンダリング時にエラーが発生しました：
                {this.state.error && this.state.error.toString()}
            </ErrorComponentDiv>
        );
    }
}

export const WrapLawComponent: React.FC<WrapperComponentProps> = props => {
    const { htmlComponentID, childProps, ChildComponent } = props;
    const options = childProps.htmlOptions.options as LawViewOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = (childProps as any).el;

    const elID = (el instanceof EL) && (std.isLaw(el) || std.isPreamble(el) || std.isTOC(el) || std.isAppdxItem(el) || std.isSupplProvisionAppdxItem(el) || std.isSupplProvision(el) || std.isArticleGroup(el) || std.isArticle(el)) && el.id;

    return (<>
        <LawErrorCatcher onError={options.onError}>
            {(typeof elID === "number") && <>
                <a className="law-anchor" data-el_id={elID.toString()} />
            </>}
            {
                (htmlComponentID === "HTMLSentenceChildrenRun")
                    ? <>
                        <WrapHTMLSentenceChildrenRun {...props}/>
                    </>
                    : (htmlComponentID === "HTMLControlRun")
                        ? <>
                            <WrapHTMLControlRun {...props}/>
                        </>
                        : <>
                            <ChildComponent {...childProps} />
                        </>
            }
        </LawErrorCatcher>
    </>);
};

export const WrapHTMLSentenceChildrenRun: React.FC<WrapperComponentProps> = props => {
    const { childProps, ChildComponent } = props;
    const options = childProps.htmlOptions.options as LawViewOptions;
    const { addAfterMountTask } = options;

    const { observed, observedRef, forceObserved } = useObserved();

    React.useEffect(() => {
        addAfterMountTask(forceObserved);
    }, [forceObserved, addAfterMountTask]);

    const newChildProps: HTMLComponentProps = {
        ...childProps,
        htmlOptions: {
            ...childProps.htmlOptions,
            renderControlEL: observed,
        },
    };

    return (<>
        <span ref={observedRef}>
            <ChildComponent {...newChildProps} />
        </span>
    </>);
};
