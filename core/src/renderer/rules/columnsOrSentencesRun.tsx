import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { withKey } from "../common";
import type { DOCXComponentProps } from "../common/docx/component";
import { DOCXMargin, wrapDOCXComponent } from "../common/docx/component";
import { w } from "../common/docx/tags";
import TextBoxRun from "../common/docx/TextBoxRun";
import type { HTMLComponentProps } from "../common/html";
import { elProps, HTMLMarginSpan, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXTable, HTMLTable } from "./table";


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

        if (std.isSentence(el)) {
            runs.push(<HTMLSentenceChildrenRun els={el.children} {...{ htmlOptions }} />);

        } else if (std.isColumn(el)) {
            if (i !== 0) {
                runs.push(<HTMLMarginSpan className="lawtext-column-margin"/>);
            }

            const subruns: JSX.Element[] = [];
            for (let j = 0; j < el.children.length; j++) {
                const subel = el.children[j];
                subruns.push(<HTMLSentenceChildrenRun els={subel.children} {...{ htmlOptions }} />);
            }

            runs.push(<span className="lawtext-column" {...elProps(el, htmlOptions)}>{withKey(subruns)}</span>);

        } else if (std.isTable(el)) {
            runs.push((
                <span style={{ display: "inline-block" }} {...elProps(el, htmlOptions)}>
                    <HTMLTable el={el} indent={0} {...{ htmlOptions }} />
                </span>
            ));

        }
        else { assertNever(el); }
    }

    return <>
        {withKey(runs)}
    </>;
}));

export const DOCXColumnsOrSentencesRun = wrapDOCXComponent("DOCXColumnsOrSentencesRun", ((props: DOCXComponentProps & ColumnsOrSentencesRunProps) => {

    const { els, docxOptions } = props;

    const runs: JSX.Element[] = [];
    for (let i = 0; i < els.length; i++) {
        const el = els[i];

        if (std.isSentence(el)) {
            runs.push(<DOCXSentenceChildrenRun els={el.children} {...{ docxOptions }} />);

        } else if (std.isColumn(el)) {
            if (i !== 0) {
                runs.push((
                    <w.r><w.t>{DOCXMargin}</w.t></w.r>
                ));
            }

            for (let j = 0; j < el.children.length; j++) {
                const subel = el.children[j];
                runs.push(<DOCXSentenceChildrenRun els={subel.children} {...{ docxOptions }} />);
            }

        } else if (std.isTable(el)) {
            runs.push((
                <TextBoxRun id={10000 + el.id} name={`Table${el.id}`}>
                    <DOCXTable el={el} indent={0} {...{ docxOptions }} />
                </TextBoxRun>
            ));

        }
        else { assertNever(el); }
    }

    return <>
        {withKey(runs)}
    </>;
}));
