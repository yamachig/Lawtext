import React, { Fragment } from "react";
import * as std from "../../law/std";
import { isSentenceChildEL, SentenceChildEL } from "../../node/cst/inline";
import { EL } from "../../node/el";
import { NotImplementedError } from "../../util";
import { DOCXAmendProvision, HTMLAmendProvision } from "./amendProvision";
import { DOCXAppdxItem, HTMLAppdxItem } from "./appdxItem";
import { DOCXArticle, HTMLArticle } from "./article";
import { DOCXArticleGroup, HTMLArticleGroup } from "./articleGroup";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun";
import { DOCXComponentProps, wrapDOCXComponent, w } from "./docx";
import { DOCXFigRun, HTMLFigRun } from "./figRun";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXItemStruct, HTMLItemStruct } from "./itemStruct";
import { DOCXLaw, HTMLLaw } from "./law";
import { DOCXList, HTMLList } from "./list";
import { DOCXNoteLike, HTMLNoteLike } from "./noteLike";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { DOCXRemarks, HTMLRemarks } from "./remarks";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXTable, HTMLTable } from "./table";

export interface AnyELsProps {
    els: (std.StdEL | std.__EL | string)[],
    indent: number,
}

export const HTMLAnyELsCSS = /*css*/`
.any-els-runs {
    margin-top: 0;
    margin-bottom: 0;
}
`;

export const HTMLAnyELsToBlocks = (props: HTMLComponentProps & AnyELsProps): (JSX.Element[] | JSX.Element)[] => {
    const { els, htmlOptions, indent } = props;

    const blocks: (JSX.Element[] | JSX.Element)[] = [];
    let currentRuns: JSX.Element[] = [];
    const flushRuns = () => {
        if (currentRuns.length > 0) {
            blocks.push(currentRuns);
            currentRuns = [];
        }
    };

    for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (std.isLaw(el)) {
            flushRuns();
            blocks.push(<HTMLLaw el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isArticleGroup(el) || std.isMainProvision(el)) {
            flushRuns();
            blocks.push(<HTMLArticleGroup el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isArticle(el)) {
            flushRuns();
            blocks.push(<HTMLArticle el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isParagraphItem(el)) {
            flushRuns();
            blocks.push(<HTMLParagraphItem el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isTable(el)) {
            flushRuns();
            blocks.push(<HTMLTable el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isTableStruct(el) || std.isFigStruct(el) || std.isNoteLikeStruct(el)) {
            flushRuns();
            blocks.push(<HTMLItemStruct el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isAppdxItem(el)) {
            flushRuns();
            blocks.push(<HTMLAppdxItem el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isRemarks(el)) {
            flushRuns();
            blocks.push(<HTMLRemarks el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isNoteLike(el)) {
            flushRuns();
            blocks.push(<HTMLNoteLike el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isList(el)) {
            flushRuns();
            blocks.push(<HTMLList el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isAmendProvision(el)) {
            flushRuns();
            blocks.push(<HTMLAmendProvision el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isSentence(el)) {
            let j = i + 1;
            while (j < els.length && std.isSentence(els[j])) j++;
            const sentences = els.slice(i, j) as std.Sentence[];
            currentRuns.push(<HTMLColumnsOrSentencesRun els={sentences} {...{ htmlOptions }} />);
            i = j - 1;
        } else if (std.isColumn(el)) {
            let j = i + 1;
            while (j < els.length && std.isColumn(els[j])) j++;
            const columns = els.slice(i, j) as std.Column[];
            currentRuns.push(<HTMLColumnsOrSentencesRun els={columns} {...{ htmlOptions }} />);
            i = j - 1;
        } else if (typeof el === "string" || isSentenceChildEL(el)) {
            // "Line", "QuoteStruct", "ArithFormula", "Ruby", "Sup", "Sub"
            let j = i + 1;
            while (j < els.length && (typeof els[j] === "string" || isSentenceChildEL(els[j] as EL))) j++;
            const sentenceChildren = els.slice(i, j) as (SentenceChildEL | string)[];
            currentRuns.push(<HTMLSentenceChildrenRun els={sentenceChildren} {...{ htmlOptions }} />);
            i = j - 1;
        } else if (std.isFig(el)) {
            currentRuns.push(<HTMLFigRun el={el} {...{ htmlOptions }} />);
        }
        else { throw new NotImplementedError(el.tag); }
    }

    flushRuns();

    return blocks;
};

export const HTMLAnyELs = wrapHTMLComponent("HTMLAnyELs", ((props: HTMLComponentProps & AnyELsProps) => {
    const { indent } = props;

    const rawBlocks = HTMLAnyELsToBlocks(props);

    const blocks: JSX.Element[] = [];

    for (const rawBlock of rawBlocks) {
        if (Array.isArray(rawBlock)) {
            blocks.push(<>
                <p className={`any-els-runs indent-${indent}`}>
                    {rawBlock.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
                </p>
            </>);
        } else {
            blocks.push(rawBlock);
        }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));

export const DOCXAnyELsToBlocks = (props: DOCXComponentProps & AnyELsProps): (JSX.Element[] | JSX.Element)[] => {
    const { els, docxOptions, indent } = props;

    const blocks: (JSX.Element[] | JSX.Element)[] = [];
    let currentRuns: JSX.Element[] = [];
    const flushRuns = () => {
        if (currentRuns.length > 0) {
            blocks.push(currentRuns);
            currentRuns = [];
        }
    };

    for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (std.isLaw(el)) {
            flushRuns();
            blocks.push(<DOCXLaw el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isArticleGroup(el) || std.isMainProvision(el)) {
            flushRuns();
            blocks.push(<DOCXArticleGroup el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isArticle(el)) {
            flushRuns();
            blocks.push(<DOCXArticle el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isParagraphItem(el)) {
            flushRuns();
            blocks.push(<DOCXParagraphItem el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isTable(el)) {
            flushRuns();
            blocks.push(<DOCXTable el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isTableStruct(el) || std.isFigStruct(el) || std.isNoteLikeStruct(el)) {
            flushRuns();
            blocks.push(<DOCXItemStruct el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isAppdxItem(el)) {
            flushRuns();
            blocks.push(<DOCXAppdxItem el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isRemarks(el)) {
            flushRuns();
            blocks.push(<DOCXRemarks el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isNoteLike(el)) {
            flushRuns();
            blocks.push(<DOCXNoteLike el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isList(el)) {
            flushRuns();
            blocks.push(<DOCXList el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isAmendProvision(el)) {
            flushRuns();
            blocks.push(<DOCXAmendProvision el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isSentence(el)) {
            let j = i + 1;
            while (j < els.length && std.isSentence(els[j])) j++;
            const sentences = els.slice(i, j) as std.Sentence[];
            currentRuns.push(<DOCXColumnsOrSentencesRun els={sentences} {...{ docxOptions }} />);
            i = j - 1;
        } else if (std.isColumn(el)) {
            let j = i + 1;
            while (j < els.length && std.isColumn(els[j])) j++;
            const columns = els.slice(i, j) as std.Column[];
            currentRuns.push(<DOCXColumnsOrSentencesRun els={columns} {...{ docxOptions }} />);
            i = j - 1;
        } else if (typeof el === "string" || isSentenceChildEL(el)) {
            // "Line", "QuoteStruct", "ArithFormula", "Ruby", "Sup", "Sub"
            let j = i + 1;
            while (j < els.length && (typeof els[j] === "string" || isSentenceChildEL(els[j] as EL))) j++;
            const sentenceChildren = els.slice(i, j) as (SentenceChildEL | string)[];
            currentRuns.push(<DOCXSentenceChildrenRun els={sentenceChildren} {...{ docxOptions }} />);
            i = j - 1;
        } else if (std.isFig(el)) {
            currentRuns.push(<DOCXFigRun el={el} {...{ docxOptions }} />);
        }
        else { throw new NotImplementedError(el.tag); }
    }

    flushRuns();

    return blocks;
};

export const DOCXAnyELs = wrapDOCXComponent("DOCXAnyELs", ((props: DOCXComponentProps & AnyELsProps) => {
    const { indent } = props;

    const rawBlocks = DOCXAnyELsToBlocks(props);

    const blocks: JSX.Element[] = [];

    for (const rawBlock of rawBlocks) {
        if (Array.isArray(rawBlock)) {
            blocks.push(<>
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    {rawBlock.map((run, i) => <Fragment key={i}>{run}</Fragment>)}
                </w.p>
            </>);
        } else {
            blocks.push(rawBlock);
        }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));

