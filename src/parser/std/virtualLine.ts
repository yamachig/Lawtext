import { AppdxItemHeadLine, ArticleGroupHeadLine, ArticleLine, BlankLine, Line, LineType, OtherLine, ParagraphItemLine, SupplProvisionAppdxItemHeadLine, SupplProvisionHeadLine, TableColumnLine, TOCHeadLine } from "../../node/cst/line";
import { isSingleParentheses } from "./util";

export enum VirtualOnlyLineType {
    IND = "IND", // Indent
    DED = "DED", // Dedent
    TAG = "TAG", // TOC ArticleGroup
    TSP = "TSP", // TOC SupplProvision
    CAP = "CAP", // Caption
}

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

export type VirtualLine = PhysicalLine | Indent | Dedent;

// const getIndentDepth = (
//     lines: Line[],
//     offset: number,
//     inTOC: boolean,
// ): number => {
//     const line = lines[offset];
//     if (line.type === LineType.BNK) {
//         return 0;
//     } else if (
//         !inTOC
//         && (line.type === LineType.ARG || line.type === LineType.SPR)
//     ) {
//         return 0;
//     } else if (line.type === LineType.OTH && isSingleParentheses(line.columns)) {
//         let currentOffset = offset + 1;
//         while (currentOffset < lines.length) {
//             const nextLine = lines[currentOffset];
//             if (nextLine.type === LineType.BNK) {
//                 currentOffset++;
//                 continue;
//             } else if (nextLine.indentTexts.length <= line.indentTexts.length) {
//                 return nextLine.indentTexts.length;
//             } else {
//                 return line.indentTexts.length;
//             }
//         }
//         return line.indentTexts.length;
//     } else {
//         return line.indentTexts.length;
//     }
// };

// const getVirtualLines = (
//     lines: Line[],
//     offset: number,
//     currentIndentDepth: number,
//     inTOCDepth: number | null,
// ): { block: Block, nextOffset: number } => {
//     const virtualLines: VirtualLine[] = [];
//     let currentOffset = offset;
//     while (currentOffset < lines.length) {
//         const line = lines[currentOffset];
//         if (
//             inTOCDepth !== null
//             && (line.type === LineType.BNK || line.indentTexts.length <= inTOCDepth)
//         ) {
//             break;
//         }
//         if (line.type === LineType.BNK) {
//             virtualLines.push({
//                 virtualIndentDepth: currentIndentDepth,
//                 line,
//             });
//             currentOffset++;
//         } else {
//             const indentDepth = getIndentDepth(lines, currentOffset, inTOCDepth !== null);
//             if (indentDepth > currentIndentDepth) {
//                 const { block: newBlock, nextOffset } = getVirtualLines(
//                     lines,
//                     currentOffset,
//                     currentIndentDepth + 1,
//                     inTOCDepth,
//                 );
//                 block.children.push(newBlock);
//                 currentOffset = nextOffset;
//             } else if (indentDepth === currentIndentDepth) {
//                 block.children.push(line);
//                 currentOffset++;
//                 if (line.type === LineType.TOC) {
//                     const { block: tocBlock, nextOffset } = getBlock(
//                         lines,
//                         currentOffset,
//                         currentIndentDepth + 1,
//                         line.indentTexts.length,
//                     );
//                     if (block.children.length > 0) {
//                         block.children.push(tocBlock);
//                     }
//                     currentOffset = nextOffset;
//                 }
//             } else {
//                 break;
//             }
//         }
//     }
//     return {
//         block,
//         nextOffset: currentOffset,
//     };
// };

export const toVirtualLines = (lines: Line[]) => {
    const virtualLines: VirtualLine[] = [];
    let virtualIndentDepth = 0;
    let inTOCDepth: number | null = null;
    for (const [i, line] of lines.entries()) {
        let type: VirtualLineType;
        let currentDepth = virtualIndentDepth;
        if (
            inTOCDepth !== null
            && (line.type === LineType.BNK || line.indentTexts.length <= inTOCDepth)
        ) {
            inTOCDepth = null;
        }
        if (line.type === LineType.BNK) {
            type = line.type;
        } else if (line.type === LineType.TOC) {
            inTOCDepth = line.indentTexts.length;
            currentDepth = line.indentTexts.length;
            type = line.type;
        } else if (line.type === LineType.ARG || line.type === LineType.SPR) {
            if (inTOCDepth !== null) {
                currentDepth = line.indentTexts.length;
                type = line.type === LineType.ARG ? VirtualOnlyLineType.TAG : VirtualOnlyLineType.TSP;
            } else if (line.controls.some(c => c.control === ":keep-indents:")) {
                currentDepth = line.indentTexts.length;
                type = line.type;
            } else {
                currentDepth = 0;
                type = line.type;
            }
        } else {
            currentDepth = line.indentTexts.length;
            type = line.type;
            if (line.type === LineType.OTH && isSingleParentheses(line) && line.controls.length === 0) {
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
            if (line.type === LineType.TBL && line.firstColumnIndicator === "") {
                for (let currentOffset = i - 1; currentOffset >= 0; currentOffset--) {
                    const prevLine = lines[currentOffset];
                    if (prevLine.type === LineType.BNK) continue;
                    if (
                        (prevLine.type === LineType.TBL && prevLine.firstColumnIndicator === "")
                        || (prevLine.indentTexts.length > line.indentTexts.length)
                    ) continue;
                    if (
                        prevLine.type === LineType.TBL && prevLine.firstColumnIndicator === "*"
                    ) {
                        currentDepth = prevLine.indentTexts.length;
                    }
                    break;
                }
            }
        }

        const indentTextLengths = "indentTexts" in line ? line.indentTexts.map(s => s.length) : [];
        const indentLength = indentTextLengths.reduce((a, b) => a + b, 0);

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
