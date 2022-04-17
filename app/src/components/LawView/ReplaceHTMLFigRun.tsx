import React, { } from "react";
import styled from "styled-components";
import { FigData, WrapperComponentProps } from "lawtext/dist/src/renderer/common/html";
import * as std from "lawtext/dist/src/law/std";
import { NotImplementedError } from "lawtext/dist/src/util";
import { useObserved } from "../useObserved";


export const ReplaceHTMLFigRun: React.FC<WrapperComponentProps> = props => {
    const { childProps, ChildComponent } = props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = (childProps as any).el as std.Fig;

    if (el.children.length > 0) {
        throw new NotImplementedError(el.outerXML());
    }

    const { getFigData } = childProps.htmlOptions;

    const figData = React.useMemo(() => {
        if (getFigData) {
            return getFigData(el.attr.src);
        }
        return null;
    }, [el.attr.src, getFigData]);

    if (figData && figData.type.includes("pdf")) {
        return (
            <PDFRun figData={figData} />
        );
    } else {
        return (
            <ChildComponent {...childProps} />
        );
    }
};

export default ReplaceHTMLFigRun;

const FigIframeDummy = styled.div`
display: inline-block;
width: 100%;
height: 80vh;
border: 1px solid gray;
`;

export const PDFRun: React.FC<{figData: FigData}> = props => {
    const { figData } = props;

    const { observed, observedRef } = useObserved();

    return (
        <span ref={observedRef}>
            {observed
                ? (
                    <iframe className="fig-iframe" src={figData.url} />
                )
                : (
                    <FigIframeDummy>[{figData.url}]</FigIframeDummy>
                )}
        </span>
    );
};
