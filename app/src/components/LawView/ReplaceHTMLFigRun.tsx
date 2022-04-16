import React, { } from "react";
import styled from "styled-components";
import { FigData, WrapperComponentProps } from "lawtext/dist/src/renderer/rules/html";
import * as std from "lawtext/dist/src/law/std";
import { NotImplementedError } from "lawtext/dist/src/util";
import { useObserved } from "../useObserved";

const FigIframeDummy = styled.div`
display: inline-block;
width: 100%;
height: 80vh;
border: 1px solid gray;
`;

const FigImgDummy = styled.div`
display: inline-block;
width: 10em;
height: 10em;
`;

export const ReplaceHTMLFigRun: React.FC<WrapperComponentProps> = props => {
    const { childProps } = props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = (childProps as any).el as std.Fig;

    if (el.children.length > 0) {
        throw new NotImplementedError(el.outerXML());
    }

    const { getFigDataInfo } = childProps.htmlOptions;

    const [ figData, setFigData ] = React.useState<FigData | null>(null);

    React.useEffect(() => {
        if (!getFigDataInfo) return;
        const cleaners: (() => unknown)[] = [];
        (async () => {
            const figDataInfo = await getFigDataInfo(el.attr.src);
            if (!figDataInfo) return;
            setFigData(figDataInfo.figData);
            cleaners.push(figDataInfo.cleaner);
        })();
        return () => {
            for (const cleaner of cleaners) cleaner();
        };
    }, [el.attr.src, getFigDataInfo]);

    const { observed, observedRef } = useObserved();

    return <span ref={observedRef}>
        {(
            (figData === null)
                ? (
                    <>[{el.attr.src}]</>
                )
                : figData.type.includes("pdf")
                    ? (
                        observed
                            ? (
                                <iframe className="fig-iframe" src={figData.url} />
                            )
                            : (
                                <FigIframeDummy>[{el.attr.src}]</FigIframeDummy>
                            )
                    )
                    : figData.type.startsWith("image/") ? (
                        observed
                            ? (
                                <img className="fig-img" src={figData.url} />
                            )
                            : (
                                <FigImgDummy>[{el.attr.src}]</FigImgDummy>
                            )
                    )
                        : (
                            <a className="fig-link" href={figData.url} type={figData.type} target="_blank" rel="noreferrer">{el.attr.src}</a>
                        )
        )}
    </span>;
};

export default ReplaceHTMLFigRun;
