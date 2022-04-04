import { factory } from "../factory";
import { BlankLine, Line, LineType, OtherLine, TableColumnLine } from "../../../node/cst/line";
import { $blankLine, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { isColumn, isParagraphItem, isSentence, isTableColumn, isTableHeaderColumn, isTableHeaderRow, isTableRow, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { AttrEntry, Control, Sentences, SentencesArray } from "../../../node/cst/inline";
import { assertNever, NotImplementedError } from "../../../util";
import $remarks, { remarksToLines } from "./$remarks";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import { paragraphItemToLines } from "./$paragraphItem";


export const tableToLines = (table: std.Table, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    for (const row of table.children) {
        for (const [i, cell] of row.children.entries()) {
            const newIndentTexts = i === 0 ? indentTexts : [...indentTexts, CST.INDENT];
            // const columnsOrSentences: (std.Column | std.Sentence)[] = [];
            const sentencesArray: SentencesArray = [];
            if (isTableColumn(cell)) {
                if (cell.children.every(isColumn)) {
                    sentencesArray.push(...columnsOrSentencesToSentencesArray(cell.children));
                } else if (cell.children.every(isSentence)) {
                    sentencesArray.push(...columnsOrSentencesToSentencesArray(cell.children));
                } else {
                    // TODO: multiline
                    // - 平成十四年法律第百三号 別表
                    // - 平成十四年法律第百八十号 附則（平成三〇年六月一日法律第四〇号） 第四条
                    // - 平成十一年法律第百二十七号 別記第一
                    for (const child of cell.children) {
                        // if (typeof child === "string") {
                        //     columnsOrSentences.push(newStdEL("Sentence", {}, child));
                        // } else
                        if (isColumn(child) || isSentence(child)) {
                            throw new NotImplementedError(`tableToLines: mixed ${child.tag}`);
                        } else if (isParagraphItem(child)) {
                            const childLines = paragraphItemToLines(child, newIndentTexts);
                            if (childLines.length === 1 && childLines[0].type === LineType.PIT) {
                                if (childLines[0].title) {
                                    sentencesArray.push(new Sentences(
                                        "",
                                        null,
                                        [],
                                        [newStdEL("Sentence", {}, [childLines[0].title])]
                                    ));
                                    if (childLines[0].sentencesArray.length > 0) {
                                        childLines[0].sentencesArray[0].leadingSpace = CST.MARGIN + childLines[0].sentencesArray[0].leadingSpace;
                                    }
                                }
                                sentencesArray.push(...childLines[0].sentencesArray);
                            } else {
                                throw new NotImplementedError(`tableToLines: ${child.tag} with ${childLines.length} lines`);
                            }
                        } else {
                            throw new NotImplementedError(`tableToLines: ${child.tag}`);
                        }
                    }
                }
            } else {
                sentencesArray.push(...columnsOrSentencesToSentencesArray([newStdEL("Sentence", {}, cell.children)]));
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
                sentencesArray,
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

    const tableStructTitleSentenceChildren = (
        tableStruct.children.find(el => el.tag === "TableStructTitle") as std.TableStructTitle | undefined
    )?.children;

    const requireControl = Boolean(tableStructTitleSentenceChildren) || tableStruct.children.length !== 1 || tableStruct.children[0].tag !== "Table";

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
            tableStructTitleSentenceChildren ? [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, tableStructTitleSentenceChildren)]
                )
            ] : [],
            CST.EOL,
        ));

        lines.push(new BlankLine(null, CST.EOL));
    }

    const childrenIndentTexts = requireControl ? [...indentTexts, CST.INDENT] : indentTexts;

    for (const child of tableStruct.children) {
        if (child.tag === "TableStructTitle") continue;

        if (child.tag === "Table") {
            const tableLines = tableToLines(child, childrenIndentTexts);
            lines.push(...tableLines);
            if (requireControl) lines.push(new BlankLine(null, CST.EOL));

        } else if (child.tag === "Remarks") {
            const remarksLines = remarksToLines(child, childrenIndentTexts);
            lines.push(...remarksLines);
            if (requireControl) lines.push(new BlankLine(null, CST.EOL));
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
        .action(({ tableColumnLines, newErrorMessage }) => {
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
                                    tableColumnLine.line.sentencesArray.flat().map(s => s.sentences).flat().map(s => s.children).flat(),
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
                                    // TODO: ParagraphItem in TableColumn
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
                        errors.push(newErrorMessage(
                            "table: No first column indicator",
                            tableColumnLine.line.firstColumnIndicatorRange ?? tableColumnLine.virtualRange,
                        ));
                        tableRows.push(tableRow);
                    } else if (isTableHeaderRow(tableRowOrNull) !== (tableColumnLine.line.columnIndicator === "*")) {
                        errors.push(newErrorMessage(
                            "table: Column indicator mismatch",
                            tableColumnLine.line.columnIndicatorRange ?? tableColumnLine.virtualRange,
                        ));
                    }

                    if (isTableHeaderRow(tableRow)) {
                        tableRow.children.push(newStdEL(
                            "TableHeaderColumn",
                            Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                            tableColumnLine.line.sentencesArray.flat().map(s => s.sentences).flat().map(s => s.children).flat(),
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
                tableRow.setRangeFromChildren();
            }
            const table = newStdEL("Table", {}, tableRows);
            return {
                value: table.setRangeFromChildren(),
                errors,
            };
        })
    );

const $tableStructChildrenBlock = makeIndentBlockWithCaptureRule(
    "$tableStructChildrenBlock",
    (factory
        .choice(c => c
            .or(() => $table)
            .or(() => $remarks)
        )
    ),
);

export const $tableStruct: WithErrorRule<std.TableStruct> = factory
    .withName("tableStruct")
    .choice(c => c
        .orSequence(s => s
            .and(() => $table, "table")
            .action(({ table }) => {
                const tableStruct = newStdEL("TableStruct", {}, [table.value]);
                return {
                    value: tableStruct.setRangeFromChildren(),
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
            .and(r => r
                .zeroOrOne(() => $tableStructChildrenBlock)
            , "childrenBlock")
            .action(({ titleLine, childrenBlock }) => {

                const children: std.TableStruct["children"] = [];
                const errors: ErrorMessage[] = [];

                const tableStructTitleText = titleLine.line.sentencesArray.map(ss => ss.sentences).flat().map(s => s.text).join("");
                const tableStructTitle = tableStructTitleText ? newStdEL(
                    "TableStructTitle",
                    {},
                    [tableStructTitleText],
                    titleLine.virtualRange,
                ) : null;

                if (tableStructTitle) {
                    children.push(tableStructTitle);
                }

                if (childrenBlock) {
                    children.push(...childrenBlock.value.flat().map(v => v.value).flat());
                    errors.push(...childrenBlock.value.flat().map(v => v.errors).flat());
                    errors.push(...childrenBlock.errors);
                }

                const tableStruct = newStdEL(
                    "TableStruct",
                    {},
                    children,
                );
                return {
                    value: tableStruct.setRangeFromChildren(),
                    errors,
                };
            })
        )
    )
    ;

export default $tableStruct;
