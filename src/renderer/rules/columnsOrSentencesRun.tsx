import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever, NotImplementedError } from "../../util";
import { DOCXComponentProps, DOCXMargin, w, wrapDOCXComponent } from "./docx";
import { HTMLComponentProps, HTMLMarginSpan, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";


interface ColumnsOrSentencesRunProps {
    els: (std.Sentence | std.Column | std.Table)[],
}

export const HTMLColumnsOrSentencesRunCSS = /*css*/`
`;

export const HTMLColumnsOrSentencesRun = wrapHTMLComponent("HTMLColumnsOrSentencesRun", ((props: HTMLComponentProps & ColumnsOrSentencesRunProps) => {

    const { els, htmlOptions } = props;

    const runs: JSX.Element[] = [];
    for (let i = 0; i < els.length; i++) {
        const el = els[i];

        if (el.tag === "Sentence") {
            runs.push(<HTMLSentenceChildrenRun els={el.children} {...{ htmlOptions }} />);

        } else if (el.tag === "Column") {
            if (i !== 0) {
                runs.push(<HTMLMarginSpan className="lawtext-column-margin"/>);
            }

            const subruns: JSX.Element[] = [];
            for (let j = 0; j < el.children.length; j++) {
                const subel = el.children[j];
                subruns.push(<HTMLSentenceChildrenRun els={subel.children} key={j} {...{ htmlOptions }} />);
            }

            runs.push(<span className="lawtext-column">{subruns}</span>);

        } else if (el.tag === "Table") {
            throw new NotImplementedError(el.tag);

        }
        else { assertNever(el); }
    }

    return <>
        {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
    </>;
}));

export const DOCXColumnsOrSentencesRun = wrapDOCXComponent("DOCXColumnsOrSentencesRun", ((props: DOCXComponentProps & ColumnsOrSentencesRunProps) => {

    const { els, docxOptions } = props;

    const runs: JSX.Element[] = [];
    for (let i = 0; i < els.length; i++) {
        const el = els[i];

        if (el.tag === "Sentence") {
            runs.push(<DOCXSentenceChildrenRun els={el.children} {...{ docxOptions }} />);

        } else if (el.tag === "Column") {
            if (i !== 0) {
                runs.push(<>
                    <w.r><w.t>{DOCXMargin}</w.t></w.r>
                </>);
            }

            for (let j = 0; j < el.children.length; j++) {
                const subel = el.children[j];
                runs.push(<DOCXSentenceChildrenRun els={subel.children} key={j} {...{ docxOptions }} />);
            }

        } else if (el.tag === "Table") {
            throw new NotImplementedError(el.tag);

        }
        else { assertNever(el); }
    }

    return <>
        {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
    </>;
}));
