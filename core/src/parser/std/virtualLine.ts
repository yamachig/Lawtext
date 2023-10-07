import { AppdxItemHeadLine, ArticleGroupHeadLine, ArticleLine, BlankLine, Line, LineType, OtherLine, ParagraphItemLine, SupplProvisionAppdxItemHeadLine, SupplProvisionHeadLine, TableColumnLine, TOCHeadLine } from "../../node/cst/line";
import { captionControl, isSingleParentheses } from "./util";

/**
 * The extension of CST with the structure of indent blocks.
 *
 * A `VirtualLine` represents either a physical line or indent/dedent in the lawtext. The `VirtualLine` object has a property named `type` with the type of `VirtualLineType`, and the different types of `VirtualLine` are distinguished by that property.
 */
export type VirtualLine = PhysicalLine | Indent | Dedent;

/**
 * The type identifiers of `VirtualLine` that are not included in {@link LineType}.
 */
export enum VirtualOnlyLineType {
    IND = "IND", // Indent
    DED = "DED", // Dedent
    TAG = "TAG", // TOC ArticleGroup
    TSP = "TSP", // TOC SupplProvision
    CAP = "CAP", // Caption
}

/**
 * The identifiers that distinguish the different types of `VirtualLine`.
 */
export type VirtualLineType = LineType | VirtualOnlyLineType;

export type PhysicalLine =
    | {
        type: LineType.BNK;
        line: BlankLine;
        virtualRange: [start: number, end: number];
        virtualIndentDepth: number;
    }
    | {
        type: LineType.TOC;
        line: TOCHeadLine;
        virtualRange: [start: number, end: number];
        virtualIndentDepth: number;
    }
    | {
        type: LineType.ARG | VirtualOnlyLineType.TAG;
        line: ArticleGroupHeadLine;
        virtualRange: [start: number, end: number];
        virtualIndentDepth: number;
    }
    | {
        type: LineType.APP;
        line: AppdxItemHeadLine;
        virtualRange: [start: number, end: number];
        virtualIndentDepth: number;
    }
    | {
        type: LineType.SPR | VirtualOnlyLineType.TSP;
        line: SupplProvisionHeadLine;
        virtualRange: [start: number, end: number];
        virtualIndentDepth: number;
    }
    | {
        type: LineType.SPA;
        line: SupplProvisionAppdxItemHeadLine;
        virtualRange: [start: number, end: number];
        virtualIndentDepth: number;
    }
    | {
        type: LineType.ART;
        line: ArticleLine;
        virtualRange: [start: number, end: number];
        virtualIndentDepth: number;
    }
    | {
        type: LineType.PIT;
        line: ParagraphItemLine;
        virtualRange: [start: number, end: number];
        virtualIndentDepth: number;
    }
    | {
        type: LineType.TBL;
        line: TableColumnLine;
        virtualRange: [start: number, end: number];
        virtualIndentDepth: number;
    }
    | {
        type: LineType.OTH | VirtualOnlyLineType.CAP;
        line: OtherLine;
        virtualRange: [start: number, end: number];
        virtualIndentDepth: number;
    }

export interface Indent {
    type: VirtualOnlyLineType.IND;
    virtualRange: [start: number, end: number];
}

export interface Dedent {
    type: VirtualOnlyLineType.DED;
    virtualRange: [start: number, end: number];
}

export const isVirtualLine = (line: Line | VirtualLine): line is VirtualLine => {
    return (
        line.type === VirtualOnlyLineType.IND
        || line.type === VirtualOnlyLineType.DED
        || "virtualRange" in line
    );
};

/**
 * The parsing logic that converts a sequence of {@link Line}s to {@link VirtualLine}s.
 */
export const toVirtualLines = (lines: Line[]) => {
    const virtualLines: VirtualLine[] = [];

    /**
     * The virtual (logical) indent depth.
     */
    let virtualIndentDepth = 0;

    /**
     * The base indent depth of a TOC. It is `null` if not in a TOC.
     */
    let inTOCDepth: number | null = null;

    for (const [i, line] of lines.entries()) {
        let type: VirtualLineType;
        let currentDepth = virtualIndentDepth;

        if (
            inTOCDepth !== null
            && (line.type === LineType.BNK || line.indentTexts.length <= inTOCDepth)
        ) {
            // When in a TOC, if the current line is blank or the current indent depth is shallower than the TOC, exit the TOC.
            inTOCDepth = null;
        }

        if (line.type === LineType.BNK) {
            // If the current line is a `BlankLine`, do nothing particular.
            type = line.type;

        } else if (line.type === LineType.TOC) {
            // If the current line is a `TOCHeadLine`, enter the TOC.
            inTOCDepth = line.indentTexts.length;
            currentDepth = line.indentTexts.length;
            type = line.type;

        } else if (line.type === LineType.ARG || line.type === LineType.SPR) {
            // If the current line is a `ArticleGroupHeadLine` or `SupplProvisionHeadLine`

            if (inTOCDepth !== null) {
                // When in TOC, process as TOC ArticleGroup or TOC SupplProvision.
                currentDepth = line.indentTexts.length;
                type = line.type === LineType.ARG ? VirtualOnlyLineType.TAG : VirtualOnlyLineType.TSP;

            } else if (line.controls.some(c => c.control === ":keep-indents:")) {
                // Keep the indent depth if `:keep-indents:` is specified.
                currentDepth = line.indentTexts.length;
                type = line.type;

            } else {
                // Treat as no-indent by default.
                currentDepth = 0;
                type = line.type;
            }

        } else {
            // For a line of remaining types

            currentDepth = line.indentTexts.length;
            type = line.type;

            // If the current line is `OtherLine` and the following line is `ArticleLine` or `ParagraphItemLine`, treat the current line as Caption.
            if (
                (line.type === LineType.OTH) && (
                    line.controls.some(c => c.control === captionControl) ||
                    (isSingleParentheses(line) && line.controls.length === 0)
                )
            ) {
                for (let currentOffset = i + 1; currentOffset < lines.length; currentOffset++) {
                    const nextLine = lines[currentOffset];
                    if (nextLine.type === LineType.BNK) continue;
                    if (
                        (nextLine.indentTexts.length == line.indentTexts.length - 1)
                        && (nextLine.type === LineType.ART || nextLine.type === LineType.PIT)
                        // && nextLine.indentTexts.length === 0
                    ) {
                        currentDepth = nextLine.indentTexts.length;
                        type = VirtualOnlyLineType.CAP;
                    }
                    break;
                }
            }

            // If the current line is `TableColumnLine` and it indicates that it is NOT a first column of the table line, search for the preceding first line and adopt the indent depth of the first line.
            // If the current line is a child of `TableColumnLine` with `multilineIndicator` keep the indent depth.
            if (line.type === LineType.TBL && line.firstColumnIndicator === "") {
                for (let currentOffset = i - 1; currentOffset >= 0; currentOffset--) {
                    const prevLine = lines[currentOffset];
                    if (prevLine.type === LineType.BNK) continue;
                    if (prevLine.indentTexts.length > line.indentTexts.length) continue;

                    if (prevLine.type === LineType.TBL) {
                        if (
                            (prevLine.multilineIndicator !== "") &&
                            (
                                (
                                    (prevLine.firstColumnIndicator === "") &&
                                    (line.indentTexts.length - prevLine.indentTexts.length >= 1)
                                )
                                || (
                                    (prevLine.firstColumnIndicator === "*") &&
                                    (line.indentTexts.length - prevLine.indentTexts.length >= 2)
                                )
                            )
                        ) break;
                        if (prevLine.firstColumnIndicator === "") continue;
                        if (prevLine.firstColumnIndicator === "*") {
                            currentDepth = prevLine.indentTexts.length;
                            break;
                        }
                    }
                    break;
                }
            }

        }

        const indentTextLengths = "indentTexts" in line ? line.indentTexts.map(s => s.length) : [];
        const indentLength = indentTextLengths.reduce((a, b) => a + b, 0);

        // Process the increase of indentation (Indent).
        if (virtualIndentDepth < currentDepth) {
            const indentTextRanges: [start: number, end: number][] = [];
            for (const [i, len] of indentTextLengths.entries()) {
                if (i === 0) {
                    const start = line.range ? line.range[0] : 0;
                    indentTextRanges.push([start, start + len]);
                } else {
                    const start = indentTextRanges[i - 1][1];
                    indentTextRanges.push([start, start + len]);
                }
            }
            while (virtualIndentDepth < currentDepth) {
                virtualLines.push({
                    type: VirtualOnlyLineType.IND,
                    virtualRange: indentTextRanges[virtualIndentDepth],
                });
                virtualIndentDepth++;
            }
        }

        // Process the decrease of indentation (Dedent).
        if (currentDepth < virtualIndentDepth) {
            while (currentDepth < virtualIndentDepth) {
                virtualLines.push({
                    type: VirtualOnlyLineType.DED,
                    virtualRange: line.range
                        ? [line.range[0], line.range[0] + indentLength]
                        : [0, indentLength],
                });
                virtualIndentDepth--;
            }
        }

        virtualLines.push({
            type,
            virtualRange: line.range
                ? [line.range[0] + indentLength, line.range[1]]
                : [indentLength, line.text().length],
            virtualIndentDepth,
            line,
        } as VirtualLine);
    }

    // Process the remaining indent depth as dedents.
    if (0 < virtualIndentDepth) {
        const lastRange = lines.slice(-1)[0]?.range ?? [0, 0];
        while (0 < virtualIndentDepth) {
            virtualLines.push({
                type: VirtualOnlyLineType.DED,
                virtualRange: [lastRange[1], lastRange[1]],
            });
            virtualIndentDepth--;
        }
    }

    return virtualLines;
};
