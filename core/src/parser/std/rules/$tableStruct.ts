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
import { anyToLines } from "./$any";
import { forceSentencesArrayToSentenceChildren } from "../../cst/rules/$sentencesArray";
import { rangeOfELs } from "../../../node/el";
import $article from "./$article";
import $articleGroup from "./$articleGroup";
import { $requireControlParagraphItem } from "./$paragraphItem";
import $figStruct from "./$figStruct";


/**
 * The renderer for {@link std.Table}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$tableStruct.spec.ts) for examples.
 */
export const tableToLines = (table: std.Table, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    for (const row of table.children) {
        for (const [i, cell] of row.children.entries()) {
            const newIndentTexts = i === 0 ? indentTexts : [...indentTexts, CST.INDENT];
            // const columnsOrSentences: (std.Column | std.Sentence)[] = [];

            const cellLine = new TableColumnLine({
                range: null,
                indentTexts: newIndentTexts,
                firstColumnIndicator: i == 0 ? "*" : "",
                midIndicatorsSpace: i == 0 ? " " : "",
                columnIndicator: isTableHeaderColumn(cell) ? "*" : "-",
                midSpace: " ",
                attrEntries: [],
                multilineIndicator: "",
                sentencesArray: [],
                lineEndText: CST.EOL,
            });
            for (const [name, value] of Object.entries(cell.attr)) {
                if ((std.defaultAttrs[cell.tag] as Record<string, string>)[name] === value) continue;
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
                    cellLine.multilineIndicator = "|";
                    if (cellLine.attrEntries.length > 0) {
                        cellLine.attrEntries.slice(-1)[0].trailingSpace = " ";
                    }
                    for (const child of cell.children) {
                        lines.push(...anyToLines(child, childrenIndentTexts));
                        lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
                    }
                }
            } else {
                cellLine.sentencesArray.push(...columnsOrSentencesToSentencesArray([newStdEL("Sentence", {}, cell.children)]));
            }
        }
    }

    return lines;
};


/**
 * The renderer for {@link std.TableStruct}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$tableStruct.spec.ts) for examples.
 */
export const tableStructToLines = (tableStruct: std.TableStruct, indentTexts: string[]): Line[] => {
    const lines: Line[] = [];

    const tableStructTitleSentenceChildren = (
        tableStruct.children.find(el => el.tag === "TableStructTitle") as std.TableStructTitle | undefined
    )?.children;

    const requireControl = Boolean(tableStructTitleSentenceChildren) || tableStruct.children.length !== 1 || tableStruct.children[0].tag !== "Table";

    if (requireControl) {

        lines.push(new OtherLine({
            range: null,
            indentTexts,
            controls: [
                new Control(
                    ":table-struct:",
                    null,
                    "",
                    null,
                ),
            ],
            sentencesArray: tableStructTitleSentenceChildren ? [
                new Sentences(
                    "",
                    null,
                    [],
                    [newStdEL("Sentence", {}, tableStructTitleSentenceChildren)]
                )
            ] : [],
            lineEndText: CST.EOL,
        }));

        lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
    }

    const childrenIndentTexts = requireControl ? [...indentTexts, CST.INDENT] : indentTexts;

    for (const child of tableStruct.children) {
        if (child.tag === "TableStructTitle") continue;

        if (child.tag === "Table") {
            const tableLines = tableToLines(child, childrenIndentTexts);
            lines.push(...tableLines);
            if (requireControl) lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));

        } else if (child.tag === "Remarks") {
            const remarksLines = remarksToLines(child, childrenIndentTexts);
            lines.push(...remarksLines);
            if (requireControl) lines.push(new BlankLine({ range: null, lineEndText: CST.EOL }));
        }
        else { assertNever(child); }
    }

    return lines;
};

const $tableCellChildrenBlock = makeDoubleIndentBlockWithCaptureRule(
    "$tableCellChildrenBlock",
    (factory
        .choice(c => c
            .orSequence(s => s
                .and(r => r.choice(c => c
                    .or(() => $articleGroup) // Resets indentation
                    .or(() => $article)
                    .or(() => $requireControlParagraphItem)
                    .or(() => $figStruct)
                    .or(() => $remarks)
                ), "any")
                .action(({ any }) => ({ value: [any.value], errors: any.errors }))
            )
            .or(r => r
                .oneMatch(({ item }) => {
                    if (
                        item.type === LineType.OTH
                    ) {
                        return {
                            value: sentencesArrayToColumnsOrSentences(item.line.sentencesArray),
                            errors: [],
                        };
                    } else {
                        return null;
                    }
                })
            )
        )
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
        .action(({ tableColumnLines }) => {
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
                            const pos = tableColumnLine.line.midSpaceRange?.[1] ?? null;
                            tableHeaderColumnChildren.push(newStdEL("Sentence", {}, [], (pos !== null ? [pos, pos] : null)));
                        }
                        const pos = tableColumnLine.line.indentsEndPos;
                        const range = rangeOfELs(tableHeaderColumnChildren) ?? (pos !== null ? [pos, pos] : null);
                        if (range && pos !== null) {
                            range[0] = pos;
                        }
                        const tableRowChildren = [
                            newStdEL(
                                "TableHeaderColumn",
                                Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                                tableHeaderColumnChildren,
                                range,
                            ),
                        ];
                        const tableRow = newStdEL(
                            "TableHeaderRow",
                            {},
                            tableRowChildren,
                            rangeOfELs(tableRowChildren),
                        );
                        tableRows.push(tableRow);
                    } else if (tableColumnLine.line.columnIndicator === "-") {
                        const tableColumnChildren = [
                            ...sentencesArrayToColumnsOrSentences(tableColumnLine.line.sentencesArray),
                            ...(tableColumnChildrenBlock?.value ?? []),
                        ];
                        if (tableColumnChildren.length === 0) {
                            const pos = tableColumnLine.line.midSpaceRange?.[1] ?? null;
                            tableColumnChildren.push(newStdEL("Sentence", {}, [], pos ? [pos, pos] : null));
                        }
                        const pos = tableColumnLine.line.indentsEndPos;
                        const range = rangeOfELs(tableColumnChildren) ?? (pos !== null ? [pos, pos] : null);
                        if (range && pos !== null) {
                            range[0] = pos;
                        }
                        const tableRowChildren = [
                            newStdEL(
                                "TableColumn",
                                Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                                tableColumnChildren,
                                range,
                            ),
                        ];
                        const tableRow = newStdEL(
                            "TableRow",
                            {},
                            tableRowChildren,
                            rangeOfELs(tableRowChildren),
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
                        const tableHeaderColumnChildren = [
                            ...forceSentencesArrayToSentenceChildren(tableColumnLine.line.sentencesArray),
                            ...(tableColumnChildrenBlock?.value ?? []),
                        ];
                        if (tableHeaderColumnChildren.length === 0) {
                            const pos = tableColumnLine.line.midSpaceRange?.[1] ?? null;
                            tableHeaderColumnChildren.push(newStdEL("Sentence", {}, [], pos ? [pos, pos] : null));
                        }
                        const pos = tableColumnLine.line.indentsEndPos;
                        const range = rangeOfELs(tableHeaderColumnChildren) ?? (pos !== null ? [pos, pos] : null);
                        if (range && pos !== null) {
                            range[0] = pos;
                        }
                        tableRow.children.push(newStdEL(
                            "TableHeaderColumn",
                            Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                            tableHeaderColumnChildren,
                            range,
                        ));
                    } else if (isTableRow(tableRow)) {
                        const tableColumnChildren = [
                            ...sentencesArrayToColumnsOrSentences(tableColumnLine.line.sentencesArray),
                            ...(tableColumnChildrenBlock?.value ?? []),
                        ];
                        if (tableColumnChildren.length === 0) {
                            const pos = tableColumnLine.line.midSpaceRange?.[1] ?? null;
                            tableColumnChildren.push(newStdEL("Sentence", {}, [], pos ? [pos, pos] : null));
                        }
                        const pos = tableColumnLine.line.indentsEndPos;
                        const range = rangeOfELs(tableColumnChildren) ?? (pos !== null ? [pos, pos] : null);
                        if (range && pos !== null) {
                            range[0] = pos;
                        }
                        tableRow.children.push(newStdEL(
                            "TableColumn",
                            Object.fromEntries(tableColumnLine.line.attrEntries.map(attrEntry => attrEntry.entry)),
                            tableColumnChildren,
                            range,
                        ));
                    }
                    else { assertNever(tableRow); }
                }
                else { assertNever(tableColumnLine.line.firstColumnIndicator); }
            }
            for (const tableRow of tableRows) {
                tableRow.range = rangeOfELs(tableRow.children);
            }
            const table = newStdEL("Table", {}, tableRows, rangeOfELs(tableRows));
            return {
                value: table,
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

/**
 * The parser rule for {@link std.TableStruct}. Please see the source code for the detailed syntax, and the [test code](https://github.com/yamachig/Lawtext/blob/main/core/src/parser/std/rules/$tableStruct.spec.ts) for examples.
 */
export const $tableStruct: WithErrorRule<std.TableStruct> = factory
    .withName("tableStruct")
    .choice(c => c
        .orSequence(s => s
            .and(() => $table, "table")
            .action(({ table }) => {
                const tableStruct = newStdEL("TableStruct", {}, [table.value], rangeOfELs([table.value]));
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
            .and(r => r
                .zeroOrOne(() => $tableStructChildrenBlock)
            , "childrenBlock")
            .action(({ titleLine, childrenBlock }) => {

                const children: std.TableStruct["children"] = [];
                const errors: ErrorMessage[] = [];

                const tableStructTitleText = titleLine.line.sentencesArray.map(ss => ss.sentences).flat().map(s => s.text()).join("");
                const tableStructTitle = tableStructTitleText ? newStdEL(
                    "TableStructTitle",
                    {},
                    [tableStructTitleText],
                    titleLine.line.sentencesArrayRange,
                ) : null;

                if (tableStructTitle) {
                    children.push(tableStructTitle);
                }

                if (childrenBlock) {
                    children.push(...childrenBlock.value.flat().map(v => v.value).flat());
                    errors.push(...childrenBlock.value.flat().map(v => v.errors).flat());
                    errors.push(...childrenBlock.errors);
                }

                const pos = titleLine.line.indentsEndPos;
                const range = rangeOfELs(children) ?? (pos !== null ? [pos, pos] : null);
                if (range && pos !== null) {
                    range[0] = pos;
                }
                const tableStruct = newStdEL(
                    "TableStruct",
                    {},
                    children,
                    range,
                );
                return {
                    value: tableStruct,
                    errors,
                };
            })
        )
    )
    ;

export default $tableStruct;
