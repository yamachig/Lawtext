import { factory } from "../factory";
import { BlankLine, Line, LineType, OtherLine, TableColumnLine } from "../../../node/cst/line";
import { $blankLine, makeDoubleIndentBlockWithCaptureRule, makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { isColumn, isSentence, isTableColumn, isTableHeaderColumn, isTableHeaderRow, isTableRow, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import CST from "../toCSTSettings";
import { ErrorMessage } from "../../cst/error";
import { AttrEntry, Control, Sentences } from "../../../node/cst/inline";
import { assertNever } from "../../../util";
import $remarks, { remarksToLines } from "./$remarks";
import { columnsOrSentencesToSentencesArray, sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import $any, { anyToLines } from "./$any";
import { forceSentencesArrayToSentenceChildren } from "../../cst/rules/$sentencesArray";


export const tableToLines = (table: std.Table, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    for (const row of table.children) {
        for (const [i, cell] of row.children.entries()) {
            const newIndentTexts = i === 0 ? indentTexts : [...indentTexts, CST.INDENT];
            // const columnsOrSentences: (std.Column | std.Sentence)[] = [];

            const cellLine = new TableColumnLine(
                null,
                newIndentTexts.length,
                newIndentTexts,
                i == 0 ? "*" : "",
                i == 0 ? " " : "",
                isTableHeaderColumn(cell) ? "*" : "-",
                " ",
                [],
                "",
                [],
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

            const childrenIndentTexts = [...indentTexts, CST.INDENT, CST.INDENT];

            if (isTableColumn(cell)) {
                if (cell.children.every(isColumn)) {
                    cellLine.sentencesArray.push(...columnsOrSentencesToSentencesArray(cell.children));
                } else if (cell.children.every(isSentence)) {
                    cellLine.sentencesArray.push(...columnsOrSentencesToSentencesArray(cell.children));
                } else {
                    // TODO: multiline
                    // - 平成十四年法律第百三号 別表
                    // - 平成十四年法律第百八十号 附則（平成三〇年六月一日法律第四〇号） 第四条
                    // - 平成十一年法律第百二十七号 別記第一
                    // - 平成三十年政令第四十七号 第一条 表 備考
                    cellLine.multilineIndicator = "|";
                    if (cellLine.attrEntries.length > 0) {
                        cellLine.attrEntries.slice(-1)[0].trailingSpace = " ";
                    }
                    for (const child of cell.children) {
                        lines.push(...anyToLines(child, childrenIndentTexts));
                        lines.push(new BlankLine(null, CST.EOL));
                    }
                }
            } else {
                cellLine.sentencesArray.push(...columnsOrSentencesToSentencesArray([newStdEL("Sentence", {}, cell.children)]));
            }
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

const $tableCellChildrenBlock = makeDoubleIndentBlockWithCaptureRule(
    "$tableCellChildrenBlock",
    (factory
        .ref(() => $any)
    ),
);

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
                    , "line")
                    .and(r => r
                        .zeroOrOne(r => r
                            .sequence(s => s
                                .andOmit(r => r.assert(({ line }) => line.line.multilineIndicator === "|"))
                                // .andOmit(r => r
                                //     .zeroOrOne(r => r
                                //         .sequence(s => s
                                //             .and(r => r.noConsumeRef(() => $indentBlock), "nextBlock")
                                //             .andOmit(r => r.assert(({ nextBlock }) => {
                                //                 console.log(JSON.stringify(nextBlock, null, 4));
                                //                 return true;
                                //             }))
                                //         )
                                //     )
                                // )
                                .andOmit(r => r.zeroOrMore(() => $blankLine))
                                .and(() => $tableCellChildrenBlock, "block")
                                // .andOmit(r => r.assert(({ block }) => {
                                //     console.log(JSON.stringify(block, null, 2));
                                //     return true;
                                // }))
                                // .andOmit(r => r
                                //     .zeroOrOne(r => r
                                //         .sequence(s => s
                                //             .and(r => r.noConsumeRef(r => r.anyOne()), "nextBlock")
                                //             .andOmit(r => r.assert(({ nextBlock }) => {
                                //                 console.log(JSON.stringify(nextBlock, null, 4));
                                //                 return true;
                                //             }))
                                //         )
                                //     )
                                // )
                                .action(({ block }) => ({
                                    value: block.value.map(v => v.value).flat(),
                                    errors: [
                                        ...block.value.map(v => v.errors).flat(),
                                        ...block.errors,
                                    ]
                                }))
                            )
                        )
                    )
                    .andOmit(r => r.zeroOrMore(() => $blankLine))
                )
            )
        , "tableColumnLines")
        .action(({ tableColumnLines, newErrorMessage }) => {
            const tableRows: (std.TableRow | std.TableHeaderRow)[] = [];
            const errors: ErrorMessage[] = [];
            for (const [tableColumnLine, tableColumnChildrenBlock] of tableColumnLines) {
                errors.push(...(tableColumnChildrenBlock?.errors ?? []));
                if (tableColumnLine.line.firstColumnIndicator === "*") {
                    if (tableColumnLine.line.columnIndicator === "*") {
                        const tableHeaderColumnChildren = [
                            ...forceSentencesArrayToSentenceChildren(tableColumnLine.line.sentencesArray),
                            ...(tableColumnChildrenBlock?.value ?? []),
                        ];
                        if (tableHeaderColumnChildren.length === 0) {
                            tableHeaderColumnChildren.push(newStdEL("Sentence"));
                        }
                        const tableRow = newStdEL(
                            "TableHeaderRow",
                            {},
                            [
                                newStdEL(
                                    "TableHeaderColumn",
                                    Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                                    tableHeaderColumnChildren,
                                ),
                            ],
                        );
                        tableRows.push(tableRow);
                    } else if (tableColumnLine.line.columnIndicator === "-") {
                        const tableColumnChildren = [
                            ...sentencesArrayToColumnsOrSentences(tableColumnLine.line.sentencesArray),
                            ...(tableColumnChildrenBlock?.value ?? []),
                        ];
                        if (tableColumnChildren.length === 0) {
                            tableColumnChildren.push(newStdEL("Sentence"));
                        }
                        const tableRow = newStdEL(
                            "TableRow",
                            {},
                            [
                                newStdEL(
                                    "TableColumn",
                                    Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                                    tableColumnChildren,
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
                        const tableHeaderColumnChildren = [
                            ...forceSentencesArrayToSentenceChildren(tableColumnLine.line.sentencesArray),
                            ...(tableColumnChildrenBlock?.value ?? []),
                        ];
                        if (tableHeaderColumnChildren.length === 0) {
                            tableHeaderColumnChildren.push(newStdEL("Sentence"));
                        }
                        tableRow.children.push(newStdEL(
                            "TableHeaderColumn",
                            Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                            tableHeaderColumnChildren
                        ).setRangeFromChildren());
                    } else if (isTableRow(tableRow)) {
                        const tableColumnChildren = [
                            ...sentencesArrayToColumnsOrSentences(tableColumnLine.line.sentencesArray),
                            ...(tableColumnChildrenBlock?.value ?? []),
                        ];
                        if (tableColumnChildren.length === 0) {
                            tableColumnChildren.push(newStdEL("Sentence"));
                        }
                        tableRow.children.push(newStdEL(
                            "TableColumn",
                            Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                            tableColumnChildren,
                        ).setRangeFromChildren());
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
