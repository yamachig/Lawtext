import React, { Fragment } from "react";
import { SentenceChildEL } from "../../node/cst/inline";
import * as std from "../../law/std";
import { assertNever, NotImplementedError } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";
import { DOCXArithFormulaRun, HTMLArithFormulaRun } from "./arithFormulaRun";
import { DOCXQuoteStructRun, HTMLQuoteStructRun } from "./quoteStructRun";

interface SentenceChildrenRunProps {
    els: (string | SentenceChildEL)[];
}

export const HTMLSentenceChildrenRunCSS = /*css*/`
`;

export const HTMLSentenceChildrenRun = wrapHTMLComponent("HTMLSentenceChildrenRun", ((props: HTMLComponentProps & SentenceChildrenRunProps) => {

    const { els, htmlOptions } = props;
    const { renderControlEL, ControlRunComponent } = htmlOptions;
    const runs: JSX.Element[] = [];

    for (const el of els) {
        if (typeof el === "string" || el instanceof String) {
            runs.push(<>{el}</>);

        } else if (el.isControl) {
            if (renderControlEL && ControlRunComponent) {
                runs.push(<ControlRunComponent el={el} {...props} />);
            } else {
                runs.push(<>{el.text}</>);
            }

        } else {
            if (el.tag === "Ruby") {
                const rb = el.children
                    .map(c =>
                        (typeof c === "string")
                            ? c
                            : !std.isRt(c)
                                ? c.text
                                : "",
                    ).join("");
                const rt = (el.children
                    .filter(c => !(typeof c === "string") && std.isRt(c)) as std.Rt[])
                    .map(c => c.text)
                    .join("");
                runs.push(<ruby>{rb}<rt>{rt}</rt></ruby>);

            } else if (el.tag === "Sub") {
                runs.push(<sub>{el.text}</sub>);

            } else if (el.tag === "Sup") {
                runs.push(<sup>{el.text}</sup>);

            } else if (el.tag === "QuoteStruct") {
                runs.push(<HTMLQuoteStructRun el={el} {...{ htmlOptions }} />);

            } else if (el.tag === "ArithFormula") {
                runs.push(<HTMLArithFormulaRun el={el} {...{ htmlOptions }} />);

            } else if (el.tag === "Line") {
                throw new NotImplementedError(el.tag);

            }
            else { assertNever(el); }
        }
    }

    return <>
        {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
    </>;
}));

export const DOCXSentenceChildrenRun = wrapDOCXComponent("DOCXSentenceChildrenRun", ((props: DOCXComponentProps & SentenceChildrenRunProps & {emphasis?: boolean}) => {

    const { els, emphasis, docxOptions } = props;
    const runs: JSX.Element[] = [];

    for (const el of els) {
        if (typeof el === "string" || el instanceof String) {
            runs.push(<w.r>
                {emphasis ? <w.rStyle w:val="Emphasis"/> : null}
                <w.t>{el}</w.t>
            </w.r>);

        } else if (el.isControl) {
            runs.push(<w.r>
                {emphasis ? <w.rStyle w:val="Emphasis"/> : null}
                <w.t>{el.text}</w.t>
            </w.r>);

        } else {
            if (el.tag === "Ruby") {
                const rb = el.children
                    .map(c =>
                        (typeof c === "string")
                            ? c
                            : !std.isRt(c)
                                ? c.text
                                : "",
                    ).join("");
                const rt = (el.children
                    .filter(c => !(typeof c === "string") && std.isRt(c)) as std.Rt[])
                    .map(c => c.text)
                    .join("");
                runs.push(<w.r>
                    {emphasis ? <w.rStyle w:val="Emphasis"/> : null}
                    <w.ruby>
                        <w.rubyBase><w.r><w.t>{rb}</w.t></w.r></w.rubyBase>
                        <w.r><w.t>{rt}</w.t></w.r>
                    </w.ruby>
                </w.r>);

            } else if (el.tag === "Sub") {
                runs.push(<w.r>
                    <w.rPr>
                        <w.vertAlign w:val="subscript"/>
                    </w.rPr>
                    <w.t>{el.text}</w.t>
                </w.r>);
                runs.push(<sub>{el.text}</sub>);

            } else if (el.tag === "Sup") {
                runs.push(<w.r>
                    <w.rPr>
                        <w.vertAlign w:val="superscript"/>
                    </w.rPr>
                    <w.t>{el.text}</w.t>
                </w.r>);
                runs.push(<sub>{el.text}</sub>);

            } else if (el.tag === "QuoteStruct") {
                runs.push(<DOCXQuoteStructRun el={el} {...{ docxOptions }} />);

            } else if (el.tag === "ArithFormula") {
                runs.push(<DOCXArithFormulaRun el={el} {...{ docxOptions }} />);

            } else if (el.tag === "Line") {
                throw new NotImplementedError(el.tag);

            }
            else { assertNever(el); }
        }
    }

    return <>
        {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
    </>;
}));
