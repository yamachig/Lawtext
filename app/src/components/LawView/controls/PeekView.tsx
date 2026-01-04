
import React from "react";
import type { HTMLComponentProps } from "lawtext/dist/src/renderer/common/html";
import { HTMLSentenceChildrenRun } from "lawtext/dist/src/renderer/rules/sentenceChildrenRun";
import styled from "styled-components";
import { em } from "../common";
import type { SentenceChildEL } from "lawtext/dist/src/node/cst/inline";


const PeekViewSpan = styled.span`
`;

const PeekViewTextSpan = styled.span`
    border-bottom: 1px solid rgba(127, 127, 127, 0.5);
    cursor: pointer;
    transition: background-color 0.3s, border-bottom-color 0.3s;
`;

enum PeekViewFloatState {
    CLOSED,
    OPEN,
}

const PeekViewFloatBlockInnerSpan = styled.div`
    position: relative;
    width: 100%;
    font-size: 1rem;
    padding: 0.5em;
`;

const PeekViewArrowSpan = styled.div`
    position: absolute;
    border-style: solid;
    border-width: 0 0.5em 0.5em 0.5em;
    border-color: transparent transparent rgba(125, 125, 125) transparent;
    margin: -0.5em 0 0 0;
`;

const PeekViewWindowSpan = styled.span`
    float: right;
    width: 100%;
    padding: 0.5em;
    border-radius: 0.2em;
    border: 1px solid rgba(125, 125, 125);
    background-color: rgba(240, 240, 240);
`;

export interface PeekViewProps {
    ChildComponent: React.ComponentType<HTMLComponentProps>,
    sentenceChildren: (string | SentenceChildEL)[],
}

interface PeekViewState { mode: PeekViewFloatState, arrowLeft: string }

export const PeekView = (props: HTMLComponentProps & PeekViewProps) => {
    const { ChildComponent, sentenceChildren, htmlOptions } = props;


    const refText = React.useRef<HTMLSpanElement>(null);
    const refWindow = React.useRef<HTMLSpanElement>(null);

    const [state, setState] = React.useState<PeekViewState>({ mode: PeekViewFloatState.CLOSED, arrowLeft: "" });

    React.useEffect(() => {
        return () => {
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    const varRefTextSpanOnClick = (/* e: React.MouseEvent<HTMLSpanElement> */) => {
        if (state.mode === PeekViewFloatState.OPEN) {
            setState(prevState => ({ ...prevState, mode: PeekViewFloatState.CLOSED }));
            window.removeEventListener("resize", updateSize);
        } else {
            setState(prevState => ({ ...prevState, mode: PeekViewFloatState.OPEN }));
            setTimeout(() => {
                updateSize();
                window.addEventListener("resize", updateSize);
            }, 0);
        }
    };

    const updateSize = () => {
        if (!refText.current || !refWindow.current) return;

        const textOffset = refText.current.getBoundingClientRect();
        const windowOffset = refWindow.current.getBoundingClientRect();

        const textLeft = textOffset ? textOffset.left : 0;
        const windowLeft = windowOffset ? windowOffset.left : 0;
        const relLeft = textLeft - windowLeft;
        const left = Math.max(relLeft, em(0.2));
        setState(prevState => ({ ...prevState, arrowLeft: `${left}px` }));
    };

    return (
        <PeekViewSpan className={state.mode === PeekViewFloatState.OPEN ? "lawtext-container-ref-open" : undefined}>

            <PeekViewTextSpan onClick={varRefTextSpanOnClick} ref={refText} className="lawtext-container-ref-text">
                <HTMLSentenceChildrenRun els={sentenceChildren} {...{ htmlOptions }} />
            </PeekViewTextSpan>

            {(state.mode !== PeekViewFloatState.CLOSED) && (
                <div
                    style={{
                        width: "calc(100% - 1rem)",
                        padding: 0,
                        margin: 0,
                        textIndent: 0,
                        fontSize: 0,
                        fontWeight: "normal",
                        position: "absolute",
                        zIndex: 100,
                        color: "initial",
                    }}
                >

                    <div
                        style={{
                            width: "100%",
                            padding: 0,
                            margin: 0,
                            textIndent: 0,
                            fontSize: 0,
                            fontWeight: "normal",
                            position: "absolute",
                            color: "initial",
                        }}
                    >
                        <PeekViewFloatBlockInnerSpan>
                            <PeekViewArrowSpan style={state.arrowLeft ? { marginLeft: state.arrowLeft } : { visibility: "hidden" }} />
                            <PeekViewWindowSpan ref={refWindow}>
                                <ChildComponent {...{ htmlOptions }} />
                            </PeekViewWindowSpan>
                        </PeekViewFloatBlockInnerSpan>
                    </div>
                </div>
            )}

        </PeekViewSpan>
    );
};

export default PeekView;
