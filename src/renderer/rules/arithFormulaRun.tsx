import React, { Fragment } from "react";
import * as std from "../../law/std";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXComponentProps, wrapDOCXComponent, w, wp, wps, a } from "./docx";
import { DOCXAnyELsToBlocks, HTMLAnyELsToBlocks } from "./any";


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

    const rawBlocks = HTMLAnyELsToBlocks({
        els: el.children,
        indent: 0,
        htmlOptions,
    });

    if (rawBlocks.every(Array.isArray)) {
        const runs = (rawBlocks as JSX.Element[][]).flat();

        return (<>
            <span className="arith-formula">
                {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
            </span>
        </>);

    } else {

        const blocks: JSX.Element[] = [];

        for (const rawBlock of rawBlocks) {
            if (Array.isArray(rawBlock)) {
                blocks.push(<>
                    <p className="arith-formula-runs">
                        {rawBlock.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
                    </p>
                </>);
            } else {
                blocks.push(rawBlock);
            }
        }

        return (
            <span className="arith-formula" style={{ display: "inline-block" }}>
                {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </span>
        );
    }
}));

export const DOCXArithFormulaRun = wrapDOCXComponent("DOCXArithFormulaRun", ((props: DOCXComponentProps & ArithFormulaRunProps) => {

    const { el, docxOptions } = props;

    const rawBlocks = DOCXAnyELsToBlocks({
        els: el.children,
        indent: 0,
        docxOptions,
    });

    if (rawBlocks.every(Array.isArray)) {
        const runs = (rawBlocks as JSX.Element[][]).flat();

        return (<>
            {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
        </>);

    } else {

        const blocks: JSX.Element[] = [];

        for (const rawBlock of rawBlocks) {
            if (Array.isArray(rawBlock)) {
                blocks.push(<>
                    <w.p>
                        {rawBlock.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
                    </w.p>
                </>);
            } else {
                blocks.push(rawBlock);
            }
        }

        return (<>
            <w.r>
                <w.drawing>
                    <wp.inline distT="0" distB="0" distL="0" distR="0">
                        <wp.extent cx="0" cy="0" />
                        <wp.docPr id={10000 + el.id} name={`ArithFormula${el.id}`} />
                        <a.graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                            <a.graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
                                <wps.wsp>
                                    <wps.cNvSpPr txBox="1">
                                        <a.spLocks noChangeArrowheads="1" />
                                    </wps.cNvSpPr>
                                    <wps.spPr bwMode="auto">
                                        <a.xfrm>
                                            <a.off x="0" y="0" />
                                        </a.xfrm>
                                        <a.prstGeom prst="rect">
                                            <a.avLst />
                                        </a.prstGeom>
                                        <a.noFill />
                                    </wps.spPr>
                                    <wps.txbx>
                                        <w.txbxContent>
                                            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
                                        </w.txbxContent>
                                    </wps.txbx>
                                    <wps.bodyPr rot="0" vert="horz" wrap="none" lIns="0" tIns="0" rIns="0" bIns="0" anchor="t" anchorCtr="0">
                                        <a.spAutoFit />
                                    </wps.bodyPr>
                                </wps.wsp>
                            </a.graphicData>
                        </a.graphic>
                    </wp.inline>
                </w.drawing>
            </w.r>
        </>);
    }
}));
