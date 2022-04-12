import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever, NotImplementedError } from "../../util";
import { HTMLComponentProps, MARGIN, wrapHTMLComponent } from "./common";
import { HTMLSentenceChildren } from "./sentenceChildren";


interface HTMLColumnsOrSentencesProps extends HTMLComponentProps {
    els: (std.Sentence | std.Column | std.Table)[],
}

export const HTMLColumnsOrSentences = wrapHTMLComponent<HTMLColumnsOrSentencesProps>("HTMLColumnsOrSentences", (props => {
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

            if (i === 0) {
                runs.push(<span className="lawtext-column lawtext-first-column">{subruns}</span>);
            } else {
                runs.push(<span className="lawtext-column">{subruns}</span>);
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
