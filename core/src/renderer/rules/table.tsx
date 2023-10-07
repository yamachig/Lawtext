import React from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { elProps, HTMLComponentProps, wrapHTMLComponent } from "../common/html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "../common/docx";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { DOCXColumnsOrSentencesRun, HTMLColumnsOrSentencesRun } from "./columnsOrSentencesRun";
import { DOCXArticleGroup, HTMLArticleGroup } from "./articleGroup";
import { DOCXArticle, HTMLArticle } from "./article";
import { newStdEL } from "../../law/std";
import { DOCXRemarks, HTMLRemarks } from "./remarks";
import { DOCXItemStruct, HTMLItemStruct } from "./itemStruct";
import { withKey } from "../common";


export interface TableProps {
    el: std.Table,
    indent: number,
}

export const HTMLTableCSS = /*css*/`
.table {
    border-collapse: collapse;
    text-indent: 0;
    table-layout: fixed;
    width: calc(100% - var(--margin-left));
}

.table-column {
    border: 1px solid black;
    min-height: 1em;
    height: 1em;
}

.table-header-column {
    border: 1px solid black;
    min-height: 1em;
    height: 1em;
}
`;

export const HTMLTable = wrapHTMLComponent("HTMLTable", ((props: HTMLComponentProps & TableProps) => {

    const { el, htmlOptions, indent } = props;

    const rows: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isTableRow(child)
            || std.isTableHeaderRow(child)
        ) {
            rows.push(<HTMLTableRow el={child} {...{ htmlOptions }} />);

        }
        else { assertNever(child); }
    }

    return (
        <table className={`table indent-${indent}`} {...elProps(el, htmlOptions)}>
            <tbody>
                {withKey(rows)}
            </tbody>
        </table>
    );
}));

export interface TableRowProps {
    el: std.TableRow | std.TableHeaderRow,
}

export const HTMLTableRow = wrapHTMLComponent("HTMLTableRow", ((props: HTMLComponentProps & TableRowProps) => {

    const { el, htmlOptions } = props;

    const columns: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isTableColumn(child)
            || std.isTableHeaderColumn(child)
        ) {
            columns.push(<HTMLTableColumn el={child} {...{ htmlOptions }} />);

        }
        else { assertNever(child); }
    }

    return (
        <tr className={"table-row"} {...elProps(el, htmlOptions)}>
            {withKey(columns)}
        </tr>
    );
}));

export interface TableColumnProps {
    el: std.TableColumn | std.TableHeaderColumn,
}

export const HTMLTableColumn = wrapHTMLComponent("HTMLTableColumn", ((props: HTMLComponentProps & TableColumnProps) => {

    const { el, htmlOptions } = props;

    const blocks: JSX.Element[] = [];

    if (std.isTableHeaderColumn(el)) {
        blocks.push((
            <div>
                <HTMLSentenceChildrenRun els={el.children} {...{ htmlOptions }} />
            </div>
        ));

    } else if (std.isTableColumn(el)) {
        if (el.children.every(std.isColumn)) {
            blocks.push((
                <div>
                    <HTMLColumnsOrSentencesRun els={el.children} {...{ htmlOptions }} />
                </div>
            ));
        } else if (el.children.every(std.isSentence)) {
            for (const child of el.children) {
                blocks.push((
                    <div>
                        <HTMLColumnsOrSentencesRun els={[child]} {...{ htmlOptions }} />
                    </div>
                ));
            }
        } else {
            for (const child of el.children) {

                if (child.tag === "Sentence" || child.tag === "Column") {
                    blocks.push((
                        <div>
                            <HTMLColumnsOrSentencesRun els={[child]} {...{ htmlOptions }} />
                        </div>
                    ));

                } else if (std.isFigStruct(child)) {
                    blocks.push(<HTMLItemStruct el={child} indent={0} {...{ htmlOptions }} />);

                } else if (std.isRemarks(child)) {
                    blocks.push(<HTMLRemarks el={child} indent={0} {...{ htmlOptions }} />);

                } else if (std.isArticleGroup(child)) {
                    blocks.push((
                        <HTMLArticleGroup el={child} indent={0} {...{ htmlOptions }} />
                    ));

                } else if (std.isArticle(child)) {
                    blocks.push((
                        <HTMLArticle el={child} indent={0} {...{ htmlOptions }} />
                    ));

                } else if (std.isParagraphItem(child)) {
                    blocks.push((
                        <HTMLParagraphItem el={child} indent={0} {...{ htmlOptions }} />
                    ));
                }
                else { assertNever(child); }
            }
        }

    }
    else { assertNever(el); }

    const style: React.CSSProperties = {};
    if (el.attr.BorderTop) style.borderTopStyle = el.attr.BorderTop;
    if (el.attr.BorderBottom) style.borderBottomStyle = el.attr.BorderBottom;
    if (el.attr.BorderLeft) style.borderLeftStyle = el.attr.BorderLeft;
    if (el.attr.BorderRight) style.borderRightStyle = el.attr.BorderRight;
    if (el.attr.Align) style.textAlign = el.attr.Align;
    if (el.attr.Valign) style.verticalAlign = el.attr.Valign;

    const attr = {
        style,
        ...((el.attr.rowspan !== undefined) ? { rowSpan: Number(el.attr.rowspan) } : {}),
        ...((el.attr.colspan !== undefined) ? { colSpan: Number(el.attr.colspan) } : {}),
    };

    if (std.isTableHeaderColumn(el)) {
        return (
            <th className={"table-header-column"} {...attr} {...elProps(el, htmlOptions)}>
                {withKey(blocks)}
            </th>
        );
    } else {
        return (
            <td className={"table-column"} {...attr} {...elProps(el, htmlOptions)}>
                {withKey(blocks)}
            </td>
        );
    }
}));


const restructureTable = (table: std.Table): std.Table => {
    const newTableChildren: std.Table["children"] = [];
    const rowspanState: Record<number, number> = {};
    const colspanValue: Record<number, number> = {};
    for (const row of table.children) {
        const newRowChildren: (typeof row)["children"][number][] = [];
        let c = 0;
        let ci = 0;
        while (true) {

            const rss = rowspanState[c] || 0;
            if (rss) {
                const colspan = colspanValue[c] || 0;
                newRowChildren.push(std.newStdEL(
                    std.isTableHeaderRow(row) ? "TableHeaderColumn" : "TableColumn",
                    {
                        __merged: "__merged",
                        ...(
                            colspan ? {
                                colspan: `${colspan}`,
                            } : {}
                        ),
                    },
                    [],
                ));
                rowspanState[c] = rss - 1;
                if (colspan) {
                    c += colspan - 1;
                }
                c += 1;
                continue;
            }

            if (ci >= row.children.length) {
                break;
            }

            const column = row.children[ci];
            newRowChildren.push(column.copy(true) as typeof column);

            {
                const colspan = Number(column.attr.colspan || 0);
                if (column.attr.rowspan !== undefined) {
                    const rowspan = Number(column.attr.rowspan);
                    rowspanState[c] = rowspan - 1;
                    colspanValue[c] = colspan;
                    if (colspan) {
                        c += colspan - 1;
                    }
                }
                c += 1;
                ci += 1;
            }
        }

        newTableChildren.push(newStdEL(
            row.tag,
            { ...row.attr },
            newRowChildren,
        ));
    }

    const ret = newStdEL(
        table.tag,
        { ...table.attr },
        newTableChildren,
    );

    return ret;
};

export const DOCXTable = wrapDOCXComponent("DOCXTable", ((props: DOCXComponentProps & TableProps) => {

    const { el: origEL, docxOptions, indent } = props;

    const rows: JSX.Element[] = [];

    const el = restructureTable(origEL);

    for (const child of el.children) {
        if (
            std.isTableRow(child)
            || std.isTableHeaderRow(child)
        ) {
            rows.push(<DOCXTableRow el={child} {...{ docxOptions }} />);

        }
        else { assertNever(child); }
    }

    return (
        <w.tbl>
            <w.tblPr>
                <w.tblStyle w:val={`IndentTable${indent}`}/>
            </w.tblPr>
            {withKey(rows)}
        </w.tbl>
    );
}));

export interface TableRowProps {
    el: std.TableRow | std.TableHeaderRow,
}

export const DOCXTableRow = wrapDOCXComponent("DOCXTableRow", ((props: DOCXComponentProps & TableRowProps) => {

    const { el, docxOptions } = props;

    const columns: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isTableColumn(child)
            || std.isTableHeaderColumn(child)
        ) {
            columns.push(<DOCXTableColumn el={child} {...{ docxOptions }} />);

        }
        else { assertNever(child); }
    }

    return (
        <w.tr>
            {withKey(columns)}
        </w.tr>
    );
}));

export interface TableColumnProps {
    el: std.TableColumn | std.TableHeaderColumn,
}

const valignDict = {
    top: "top",
    middle: "center",
    bottom: "bottom",
};

const borderDict = {
    none: "nil",
    solid: "single",
    dotted: "dotted",
    double: "double",
};

export const DOCXTableColumn = wrapDOCXComponent("DOCXTableColumn", ((props: DOCXComponentProps & TableColumnProps) => {

    const { el, docxOptions } = props;

    const blocks: JSX.Element[] = [];

    if (std.isTableHeaderColumn(el)) {
        blocks.push((
            <w.p>
                <DOCXSentenceChildrenRun els={el.children} {...{ docxOptions }} />
            </w.p>
        ));

    } else if (std.isTableColumn(el)) {
        if (el.children.every(std.isColumn)) {
            blocks.push((
                <w.p>
                    <DOCXColumnsOrSentencesRun els={el.children} {...{ docxOptions }} />
                </w.p>
            ));
        } else if (el.children.every(std.isSentence)) {
            for (const child of el.children) {
                blocks.push((
                    <w.p>
                        <DOCXColumnsOrSentencesRun els={[child]} {...{ docxOptions }} />
                    </w.p>
                ));
            }
        } else {
            for (const child of el.children) {

                if (child.tag === "Sentence" || child.tag === "Column") {
                    blocks.push((
                        <w.p>
                            <DOCXColumnsOrSentencesRun els={[child]} {...{ docxOptions }} />
                        </w.p>
                    ));

                } else if (std.isFigStruct(child)) {
                    blocks.push(<DOCXItemStruct el={child} indent={0} {...{ docxOptions }} />);

                } else if (std.isRemarks(child)) {
                    blocks.push(<DOCXRemarks el={child} indent={0} {...{ docxOptions }} />);

                } else if (std.isArticleGroup(child)) {
                    blocks.push((
                        <DOCXArticleGroup el={child} indent={0} {...{ docxOptions }} />
                    ));

                } else if (std.isArticle(child)) {
                    blocks.push((
                        <DOCXArticle el={child} indent={0} {...{ docxOptions }} />
                    ));

                } else if (std.isParagraphItem(child)) {
                    blocks.push((
                        <DOCXParagraphItem el={child} indent={0} {...{ docxOptions }} />
                    ));
                }
                else { assertNever(child); }
            }
        }

    }
    else { assertNever(el); }

    if ((el.attr as Record<string, string>).__merged !== undefined) {
        return (
            <w.tc>
                <w.tcPr>
                    {(el.attr.colspan !== undefined) && <w.gridSpan w:val={el.attr.colspan}/>}
                    <w.vMerge/>
                </w.tcPr>
                <w.p></w.p>
            </w.tc>
        );
    } else {
        return (
            <w.tc>
                <w.tcPr>
                    {(el.attr.colspan !== undefined) && <w.gridSpan w:val={el.attr.colspan}/>}
                    {(el.attr.rowspan !== undefined) && <w.vMerge w:val="restart"/>}
                    {(el.attr.Align !== undefined) && <w.jc w:val={el.attr.Align}/>}
                    {(el.attr.Valign !== undefined) && <w.vAlign w:val={valignDict[el.attr.Valign]}/>}
                    {((el.attr.BorderTop ?? el.attr.BorderBottom ?? el.attr.BorderLeft ?? el.attr.BorderRight) !== undefined) && (
                        <w.tcBorders>
                            {(el.attr.BorderTop !== undefined) && <w.top w:val={borderDict[el.attr.BorderTop]}/>}
                            {(el.attr.BorderBottom !== undefined) && <w.bottom w:val={borderDict[el.attr.BorderBottom]}/>}
                            {(el.attr.BorderLeft !== undefined) && <w.left w:val={borderDict[el.attr.BorderLeft]}/>}
                            {(el.attr.BorderRight !== undefined) && <w.right w:val={borderDict[el.attr.BorderRight]}/>}
                        </w.tcBorders>
                    )}
                </w.tcPr>
                {withKey(blocks)}
            </w.tc>
        );
    }
}));
