import { factory } from "../factory";
import { Line, LineType, OtherLine, TableColumnLine } from "../../../node/cst/line";
import { $blankLine, $optBNK_DEDENT, $optBNK_INDENT, WithErrorRule } from "../util";
import { isColumn, isSentence, isTableColumn, isTableHeaderColumn, isTableHeaderRow, isTableRow, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { AttrEntry, Control, Sentences } from "../../../node/cst/inline";
import { rangeOfELs } from "../../../node/el";
import { assertNever, NotImplementedError } from "../../../util";
import $remarks, { remarksToLines } from "./$remarks";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";


export const tableToLines = (table: std.Table, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    for (const row of table.children) {
        for (const [i, cell] of row.children.entries()) {
            const newIndentTexts = i === 0 ? indentTexts : [...indentTexts, CST.INDENT];
            const columnsOrSentences: (std.Column | std.Sentence)[] = [];
            if (isTableColumn(cell)) {
                for (const child of cell.children) {
                    if (typeof child === "string") {
                        columnsOrSentences.push(newStdEL("Sentence", {}, cell.children));
                    } else if (isColumn(child) || isSentence(child)) {
                        columnsOrSentences.push(child);
                    } else {
                        throw new NotImplementedError(`tableToLines: ${child.tag}`);
                    }
                }
            } else {
                columnsOrSentences.push(newStdEL("Sentence", {}, cell.children));
            }
            const cellLine = new TableColumnLine(
                null,
                newIndentTexts.length,
                newIndentTexts,
                i == 0 ? "*" : "",
                i == 0 ? " " : "",
                isTableHeaderColumn(cell) ? "*" : "-",
                " ",
                [],
                columnsOrSentencesToSentencesArray(columnsOrSentences),
                CST.EOL,
            );
            for (const [name, value] of Object.entries(cell.attr)) {
                cellLine.attrEntries.push(
                    new AttrEntry(
                        `[${name}="${value}"]`,
                        [name, value],
                        null,
                        "",
                        null,
                    )
                );
            }
            lines.push(cellLine);
        }
    }

    return lines;
};


export const tableStructToLines = (tableStruct: std.TableStruct, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const tableStructTitleText = tableStruct.children.find(el => el.tag === "TableStructTitle")?.text ?? "";

    const requireControl = Boolean(tableStructTitleText) || tableStruct.children[0].tag !== "Table";

    if (requireControl) {

        lines.push(new OtherLine(
            null,
            indentTexts.length,
            indentTexts,
            [
                new Control(
                    ":table-struct:",
                    null,
                    "",
                    null,
                ),
            ],
            tableStructTitleText ? [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, [tableStructTitleText])]
                )
            ] : [],
            CST.EOL,
        ));
    }

    const childrenIndentTexts = requireControl ? [...indentTexts, CST.INDENT] : indentTexts;

    for (const child of tableStruct.children) {
        if (child.tag === "TableStructTitle") continue;

        if (child.tag === "Table") {
            const tableLines = tableToLines(child, childrenIndentTexts);
            lines.push(...tableLines);

        } else if (child.tag === "Remarks") {
            const remarksLines = remarksToLines(child, childrenIndentTexts);
            lines.push(...remarksLines);
        }
        else { assertNever(child); }
    }

    return lines;
};

const $table: WithErrorRule<std.Table> = factory
    .withName("table")
    .sequence(s => s
        .and(r => r
            .oneOrMore(r => r
                .sequence(s => s
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                    .and(r => r
                        .oneMatch(({ item }) => {
                            if (item.type === LineType.TBL) {
                                return item;
                            } else {
                                return null;
                            }
                        })
                    )
                )
            )
        , "tableColumnLines")
        .action(({ tableColumnLines }) => {
            const tableRows: (std.TableRow | std.TableHeaderRow)[] = [];
            const errors: ErrorMessage[] = [];
            for (const tableColumnLine of tableColumnLines) {
                if (tableColumnLine.line.firstColumnIndicator === "*") {
                    if (tableColumnLine.line.columnIndicator === "*") {
                        const tableRow = newStdEL(
                            "TableHeaderRow",
                            {},
                            [
                                newStdEL(
                                    "TableHeaderColumn",
                                    Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                                    sentencesArrayToColumnsOrSentences(tableColumnLine.line.sentencesArray),
                                ),
                            ],
                        );
                        tableRows.push(tableRow);
                    } else if (tableColumnLine.line.columnIndicator === "-") {
                        const tableRow = newStdEL(
                            "TableRow",
                            {},
                            [
                                newStdEL(
                                    "TableColumn",
                                    Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                                    sentencesArrayToColumnsOrSentences(tableColumnLine.line.sentencesArray),
                                ),
                            ],
                        );
                        tableRows.push(tableRow);
                    }
                    else { assertNever(tableColumnLine.line.columnIndicator); }
                } else if (tableColumnLine.line.firstColumnIndicator === "") {
                    const tableRowOrNull = tableRows.length > 0 ? tableRows[tableRows.length - 1] : null;

                    const tableRow = tableRowOrNull ?? newStdEL(
                        tableColumnLine.line.columnIndicator === "*" ? "TableHeaderRow"
                            : tableColumnLine.line.columnIndicator === "-" ? "TableRow"
                                : assertNever(tableColumnLine.line.columnIndicator),
                    );

                    if (tableRowOrNull === null) {
                        errors.push(new ErrorMessage(
                            "table: No first column indicator",
                            tableColumnLine.line.firstColumnIndicatorRange ?? tableColumnLine.virtualRange,
                        ));
                        tableRows.push(tableRow);
                    } else if (isTableHeaderRow(tableRowOrNull) !== (tableColumnLine.line.columnIndicator === "*")) {
                        errors.push(new ErrorMessage(
                            "table: Column indicator mismatch",
                            tableColumnLine.line.columnIndicatorRange ?? tableColumnLine.virtualRange,
                        ));
                    }

                    if (isTableHeaderRow(tableRow)) {
                        tableRow.children.push(newStdEL(
                            "TableHeaderColumn",
                            Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                            sentencesArrayToColumnsOrSentences(tableColumnLine.line.sentencesArray),
                        ));
                    } else if (isTableRow(tableRow)) {
                        tableRow.children.push(newStdEL(
                            "TableColumn",
                            Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                            sentencesArrayToColumnsOrSentences(tableColumnLine.line.sentencesArray),
                        ));
                    }
                    else { assertNever(tableRow); }
                }
                else { assertNever(tableColumnLine.line.firstColumnIndicator); }
            }
            for (const tableRow of tableRows) {
                tableRow.range = rangeOfELs(tableRow.children);
            }
            const table = newStdEL("Table", {}, tableRows);
            table.range = rangeOfELs(table.children);
            return {
                value: table,
                errors,
            };
        })
    );

export const $tableStruct: WithErrorRule<std.TableStruct> = factory
    .withName("tableStruct")
    .choice(c => c
        .orSequence(s => s
            .and(() => $table, "table")
            .action(({ table }) => {
                const tableStruct = newStdEL("TableStruct", {}, [table.value]);
                tableStruct.range = rangeOfELs(tableStruct.children);
                return {
                    value: tableStruct,
                    errors: table.errors,
                };
            })
        )
        .orSequence(s => s
            .and(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.OTH
                        && item.line.type === LineType.OTH
                        && item.line.controls.some(c => /^:table-struct:$/.exec(c.control))
                    ) {
                        return item;
                    } else {
                        return null;
                    }
                })
            , "titleLine")
            .and(r => r.zeroOrMore(() => $blankLine))
            .and(() => $optBNK_INDENT)
            .and(r => r.zeroOrOne(() => $remarks), "remarks1")
            .and(r => r.zeroOrMore(() => $blankLine))
            .and(() => $table, "table")
            .and(r => r.zeroOrMore(() => $blankLine))
            .and(r => r.zeroOrOne(() => $remarks), "remarks2")
            .and(r => r
                .choice(c => c
                    .or(() => $optBNK_DEDENT)
                    .or(r => r
                        .noConsumeRef(r => r
                            .sequence(s => s
                                .and(r => r.zeroOrMore(() => $blankLine))
                                .and(r => r.anyOne(), "unexpected")
                                .action(({ unexpected }) => {
                                    return new ErrorMessage(
                                        "$tableStruct: この前にある表の終了時にインデント解除が必要です。",
                                        unexpected.virtualRange,
                                    );
                                })
                            )
                        )
                    )
                )
            , "error")
            .action(({ titleLine, remarks1, table, remarks2, error }) => {
                // for (let i = 0; i < children.value.length; i++) {
                //     children.value[i].attr.Num = `${i + 1}`;
                // }
                const tableStructTitleText = titleLine.line.sentencesArray.map(ss => ss.sentences).flat().map(s => s.text).join("");
                const tableStructTitle = tableStructTitleText ? newStdEL(
                    "TableStructTitle",
                    {},
                    [tableStructTitleText],
                    titleLine.virtualRange,
                ) : null;
                const tableStruct = newStdEL(
                    "TableStruct",
                    {},
                    [
                        ...(tableStructTitle ? [tableStructTitle] : []),
                        ...(remarks1 ? [remarks1.value] : []),
                        table.value,
                        ...(remarks2 ? [remarks2.value] : []),
                    ],
                );
                tableStruct.range = rangeOfELs(tableStruct.children);
                return {
                    value: tableStruct,
                    errors: [
                        ...(remarks1?.errors ?? []),
                        ...table.errors,
                        ...(remarks2?.errors ?? []),
                        ...(error instanceof ErrorMessage ? [error] : []),
                    ],
                };
            })
        )
    )
    ;

export default $tableStruct;
