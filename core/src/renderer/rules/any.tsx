import React from "react";
import * as std from "../../law/std";
import type { SentenceChildEL } from "../../node/cst/inline";
import { isSentenceChildEL } from "../../node/cst/inline";
import type { EL } from "../../node/el";
import { NotImplementedError } from "../../util";
import { DOCXAmendProvision, HTMLAmendProvision } from "./amendProvision";
import { DOCXAppdxItem, HTMLAppdxItem } from "./appdxItem";
import { DOCXArticle, HTMLArticle } from "./article";
import { DOCXArticleGroup, HTMLArticleGroup } from "./articleGroup";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun";
import type { DOCXComponentProps } from "../common/docx/component";
import { wrapDOCXComponent } from "../common/docx/component";
import { w } from "../common/docx/tags";
import { DOCXFigRun, HTMLFigRun } from "./figRun";
import type { HTMLComponentProps } from "../common/html";
import { wrapHTMLComponent } from "../common/html";
import { DOCXItemStruct, HTMLItemStruct } from "./itemStruct";
import { DOCXEnactStatement, DOCXLaw, DOCXPreamble, HTMLEnactStatement, HTMLLaw, HTMLPreamble } from "./law";
import { DOCXList, HTMLList } from "./list";
import { DOCXNoteLike, HTMLNoteLike } from "./noteLike";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { DOCXRemarks, HTMLRemarks } from "./remarks";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXSupplNote, HTMLSupplNote } from "./supplNote";
import { DOCXTable, HTMLTable } from "./table";
import { DOCXTOC, DOCXTOCItem, HTMLTOC, HTMLTOCItem } from "./toc";
import { withKey } from "../common";

export interface AnyELsProps {
    els: (std.StdEL | std.__EL | string)[],
    indent: number,
}

export const HTMLAnyELsCSS = /*css*/`

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
        } else if (std.isArticleGroup(el) || std.isMainProvision(el) || std.isSupplProvision(el)) {
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
        } else if (std.isSupplNote(el)) {
            flushRuns();
            blocks.push(<HTMLSupplNote el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isEnactStatement(el)) {
            flushRuns();
            blocks.push(<HTMLEnactStatement el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isPreamble(el)) {
            flushRuns();
            blocks.push(<HTMLPreamble el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isTOC(el)) {
            flushRuns();
            blocks.push(<HTMLTOC el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isTOCItem(el)) {
            flushRuns();
            blocks.push(<HTMLTOCItem el={el} indent={indent} {...{ htmlOptions }} />);
        } else if (std.isArticleGroupTitle(el) || std.isLawTitle(el)) {
            flushRuns();
            blocks.push((
                <div className={`any-els-tag any-els-tag-${el.tag} indent-${indent}`}>
                    <HTMLSentenceChildrenRun els={el.children} {...{ htmlOptions }} />
                </div>
            ));
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
            blocks.push((
                <div className={`any-els-runs indent-${indent}`}>
                    {withKey(rawBlock)}
                </div>
            ));
        } else {
            blocks.push(rawBlock);
        }
    }

    return (<>
        {withKey(blocks)}
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
        } else if (std.isArticleGroup(el) || std.isMainProvision(el) || std.isSupplProvision(el)) {
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
        } else if (std.isSupplNote(el)) {
            flushRuns();
            blocks.push(<DOCXSupplNote el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isEnactStatement(el)) {
            flushRuns();
            blocks.push(<DOCXEnactStatement el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isPreamble(el)) {
            flushRuns();
            blocks.push(<DOCXPreamble el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isTOC(el)) {
            flushRuns();
            blocks.push(<DOCXTOC el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isTOCItem(el)) {
            flushRuns();
            blocks.push(<DOCXTOCItem el={el} indent={indent} {...{ docxOptions }} />);
        } else if (std.isArticleGroupTitle(el) || std.isLawTitle(el)) {
            flushRuns();
            blocks.push((
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    <DOCXSentenceChildrenRun els={el.children} emphasis={true} {...{ docxOptions }} />
                </w.p>
            ));
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
            blocks.push((
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    {withKey(rawBlock)}
                </w.p>
            ));
        } else {
            blocks.push(rawBlock);
        }
    }

    return (<>
        {withKey(blocks)}
    </>);
}));

