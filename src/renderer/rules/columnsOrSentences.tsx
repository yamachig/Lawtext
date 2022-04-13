import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever, NotImplementedError } from "../../util";
import { DOCXComponentProps, w } from "./docx";
import { HTMLComponentProps, MARGIN, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildren, HTMLSentenceChildren } from "./sentenceChildren";


interface ColumnsOrSentencesProps {
    els: (std.Sentence | std.Column | std.Table)[],
}

export const HTMLColumnsOrSentences = wrapHTMLComponent<HTMLComponentProps & ColumnsOrSentencesProps>("HTMLColumnsOrSentences", (props => {
    const { els, htmlOptions } = props;

    const runs: JSX.Element[] = [];
    for (let i = 0; i < els.length; i++) {
        const el = els[i];

        if (el.tag === "Sentence") {
            runs.push(<HTMLSentenceChildren els={el.children} {...{ htmlOptions }} />);

        } else if (el.tag === "Column") {
            if (i !== 0) {
                runs.push(<span className="lawtext-column-margin">{MARGIN}</span>);
            }

            const subruns: JSX.Element[] = [];
            for (let j = 0; j < el.children.length; j++) {
                const subel = el.children[j];
                subruns.push(<HTMLSentenceChildren els={subel.children} key={j} {...{ htmlOptions }} />);
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

export const DOCXColumnsOrSentences: React.FC<DOCXComponentProps & ColumnsOrSentencesProps> = props => {
    const { els, docxOptions } = props;

    const runs: JSX.Element[] = [];
    for (let i = 0; i < els.length; i++) {
        const el = els[i];

        if (el.tag === "Sentence") {
            runs.push(<DOCXSentenceChildren els={el.children} {...{ docxOptions }} />);

        } else if (el.tag === "Column") {
            if (i !== 0) {
                runs.push(<>
                    <w.r><w.t>{MARGIN}</w.t></w.r>
                </>);
            }

            for (let j = 0; j < el.children.length; j++) {
                const subel = el.children[j];
                runs.push(<DOCXSentenceChildren els={subel.children} key={j} {...{ docxOptions }} />);
            }

        } else if (el.tag === "Table") {
            throw new NotImplementedError(el.tag);

        }
        else { assertNever(el); }
    }

    return <>
        {runs.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
    </>;
};
