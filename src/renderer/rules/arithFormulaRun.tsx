import React, { Fragment } from "react";
import * as std from "../../law/std";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";
import { AnyELProps, DOCXAnyEL, HTMLAnyEL } from "./any";
import { isSentenceChildEL } from "../../node/cst/inline";
import { DOCXFigRun, HTMLFigRun } from "./figRun";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun";


export interface ArithFormulaRunProps {
    el: std.ArithFormula,
}

export const HTMLArithFormulaRunCSS = /*css*/`
.arith-formula-runs {
    margin-top: 0;
    margin-bottom: 0;
}
`;

export const HTMLArithFormulaRun = wrapHTMLComponent("HTMLArithFormulaRun", ((props: HTMLComponentProps & ArithFormulaRunProps) => {

    const { el, htmlOptions } = props;

    const blocks: JSX.Element[] = [];
    let currentRuns: JSX.Element[] = [];
    const flushRuns = () => {
        if (currentRuns.length > 0) {
            blocks.push(<>
                <p className="arith-formula-runs">
                    {currentRuns.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
                </p>
            </>);
            currentRuns = [];
        }
    };

    for (const child of el.children) {
        if (typeof child === "string") {
            currentRuns.push(<HTMLSentenceChildrenRun els={[child]} {...{ htmlOptions }} />);

        } else if (std.isSentence(child)) {
            currentRuns.push(<HTMLColumnsOrSentencesRun els={[child]} {...{ htmlOptions }} />);

        } else if (isSentenceChildEL(child)) {
            currentRuns.push(<HTMLSentenceChildrenRun els={[child]} {...{ htmlOptions }} />);

        } else if (std.isFig(child)) {
            currentRuns.push(<HTMLFigRun el={child} {...{ htmlOptions }} />);

        } else {
            flushRuns();
            blocks.push(<HTMLAnyEL {...({ el: child, indent: 0 } as AnyELProps)} {...{ htmlOptions }} />);

        }
    }

    if (currentRuns.length > 0 || blocks.length == 0) {
        return (<>
            <span className="arith-formula">
                {currentRuns.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
            </span>
        </>);

    } else {
        flushRuns();

        return (
            <span className="arith-formula" style={{ display: "inline-block" }}>
                {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </span>
        );
    }
}));

export const DOCXArithFormulaRun = wrapDOCXComponent("DOCXArithFormulaRun", ((props: DOCXComponentProps & ArithFormulaRunProps) => {

    const { el, docxOptions } = props;

    const blocks: JSX.Element[] = [];
    let currentRuns: JSX.Element[] = [];
    const flushRuns = () => {
        if (currentRuns.length > 0) {
            blocks.push(<>
                <w.p className="arith-formula-runs">
                    {currentRuns.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
                </w.p>
            </>);
            currentRuns = [];
        }
    };

    for (const child of el.children) {
        if (typeof child === "string") {
            currentRuns.push(<DOCXSentenceChildrenRun els={[child]} {...{ docxOptions }} />);

        } else if (std.isSentence(child)) {
            currentRuns.push(<DOCXColumnsOrSentencesRun els={[child]} {...{ docxOptions }} />);

        } else if (isSentenceChildEL(child)) {
            currentRuns.push(<DOCXSentenceChildrenRun els={[child]} {...{ docxOptions }} />);

        } else if (std.isFig(child)) {
            currentRuns.push(<DOCXFigRun el={child} {...{ docxOptions }} />);

        } else {
            flushRuns();
            blocks.push(<DOCXAnyEL {...({ el: child, indent: 0 } as AnyELProps)} {...{ docxOptions }} />);

        }
    }

    if (currentRuns.length > 0 || blocks.length == 0) {
        return (<>
            {currentRuns.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
        </>);

    } else {
        flushRuns();

        const runs = blocks.map((block =>
            (block.props.children as JSX.Element[] | undefined)
                ?.filter(c => c.type === "w:r") ?? []
        )).flat();

        return (<>
            {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
        </>);
    }
}));
