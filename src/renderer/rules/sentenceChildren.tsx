import React, { Fragment } from "react";
import { SentenceChildEL } from "../../node/cst/inline";
import * as std from "../../law/std";
import { assertNever, NotImplementedError } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "./common";


interface HTMLSentenceChildrenProps extends HTMLComponentProps {
    els: (string | SentenceChildEL)[];
}

export const HTMLSentenceChildren = wrapHTMLComponent<HTMLSentenceChildrenProps>("HTMLSentenceChildren", (props => {
    const { els, htmlOptions: { renderControlEL, ControlRunComponent } } = props;
    const runs: JSX.Element[] = [];

    for (const _el of els) {
        if (typeof _el === "string" || _el instanceof String) {
            runs.push(<>{_el}</>);

        } else if (_el.isControl) {
            if (renderControlEL && ControlRunComponent) {
                runs.push(<ControlRunComponent el={_el} {...props} />);
            } else {
                runs.push(<>{_el.text}</>);
            }

        } else {
            const el: std.Line | std.QuoteStruct | std.ArithFormula | std.Ruby | std.Sup | std.Sub = _el;
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
                throw new NotImplementedError(el.tag);
                // runs.push(<QuoteStructRunComponent el={el} ls={props.ls} />);

            } else if (el.tag === "ArithFormula") {
                throw new NotImplementedError(el.tag);
                // runs.push(<ArithFormulaRunComponent el={el} ls={props.ls} />);

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
