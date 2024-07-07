import React from "react";
import { SentenceChildEL } from "../../node/cst/inline";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { elProps, HTMLComponentProps, wrapHTMLComponent } from "../common/html";
import { DOCXComponentProps, wrapDOCXComponent } from "../common/docx/component";
import { w } from "../common/docx/tags";
import { DOCXArithFormulaRun, HTMLArithFormulaRun } from "./arithFormulaRun";
import { DOCXQuoteStructRun, HTMLQuoteStructRun } from "./quoteStructRun";
import { HTMLControlRun } from "./controlRun";
import { withKey } from "../common";

interface SentenceChildrenRunProps {
    els: (string | SentenceChildEL)[];
}

export const HTMLSentenceChildrenRunCSS = /*css*/`
`;

export const HTMLSentenceChildrenRun = wrapHTMLComponent("HTMLSentenceChildrenRun", ((props: HTMLComponentProps & SentenceChildrenRunProps) => {

    const { els, htmlOptions } = props;
    const { renderControlEL } = htmlOptions;
    const runs: (JSX.Element | string)[] = [];

    for (const el of els) {
        if (typeof el === "string") {
            runs.push(el);

        } else if (el.isControl) {
            if (renderControlEL) {
                runs.push(<HTMLControlRun el={el} {...props} />);
            } else {
                runs.push(el.text());
            }

        } else {
            if (el.tag === "Ruby") {
                const rb = el.children
                    .map(c =>
                        (typeof c === "string")
                            ? c
                            : !std.isRt(c)
                                ? c.text()
                                : "",
                    ).join("");
                const rt = (el.children
                    .filter(c => !(typeof c === "string") && std.isRt(c)) as std.Rt[])
                    .map(c => c.text())
                    .join("");
                runs.push(<ruby {...elProps(el, htmlOptions)}>{rb}<rt>{rt}</rt></ruby>);

            } else if (el.tag === "Sub") {
                runs.push(<sub {...elProps(el, htmlOptions)}>{el.text()}</sub>);

            } else if (el.tag === "Sup") {
                runs.push(<sup {...elProps(el, htmlOptions)}>{el.text()}</sup>);

            } else if (el.tag === "QuoteStruct") {
                runs.push(<HTMLQuoteStructRun el={el} {...{ htmlOptions }} />);

            } else if (el.tag === "ArithFormula") {
                runs.push(<HTMLArithFormulaRun el={el} {...{ htmlOptions }} />);

            } else if (el.tag === "Line") {
                return ((
                    <span className="line" {...elProps(el, htmlOptions)}>
                        <HTMLSentenceChildrenRun els={el.children} {...{ htmlOptions }} />
                    </span>
                ));

            }
            else { assertNever(el); }
        }
    }

    return <>
        {withKey(runs)}
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
                <w.t>{el.text()}</w.t>
            </w.r>);

        } else {
            if (el.tag === "Ruby") {
                const rb = el.children
                    .map(c =>
                        (typeof c === "string")
                            ? c
                            : !std.isRt(c)
                                ? c.text()
                                : "",
                    ).join("");
                const rt = (el.children
                    .filter(c => !(typeof c === "string") && std.isRt(c)) as std.Rt[])
                    .map(c => c.text())
                    .join("");
                runs.push(<w.r>
                    {emphasis ? <w.rStyle w:val="Emphasis"/> : null}
                    <w.ruby>
                        <w.rt><w.r><w.t>{rt}</w.t></w.r></w.rt>
                        <w.rubyBase><w.r><w.t>{rb}</w.t></w.r></w.rubyBase>
                    </w.ruby>
                </w.r>);

            } else if (el.tag === "Sub") {
                runs.push(<w.r>
                    <w.rPr>
                        <w.vertAlign w:val="subscript"/>
                    </w.rPr>
                    <w.t>{el.text()}</w.t>
                </w.r>);

            } else if (el.tag === "Sup") {
                runs.push(<w.r>
                    <w.rPr>
                        <w.vertAlign w:val="superscript"/>
                    </w.rPr>
                    <w.t>{el.text()}</w.t>
                </w.r>);

            } else if (el.tag === "QuoteStruct") {
                runs.push(<DOCXQuoteStructRun el={el} {...{ docxOptions }} />);

            } else if (el.tag === "ArithFormula") {
                runs.push(<DOCXArithFormulaRun el={el} {...{ docxOptions }} />);

            } else if (el.tag === "Line") {
                runs.push(<DOCXSentenceChildrenRun els={el.children} {...{ docxOptions }} />);

            }
            else { assertNever(el); }
        }
    }

    return <>
        {withKey(runs)}
    </>;
}));
