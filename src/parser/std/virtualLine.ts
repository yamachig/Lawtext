import { Line, LineType } from "../../node/cst/line";
import { isSingleParentheses } from "./util";

export enum VirtualOnlyLineType {
    IND = "IND", // Indent
    DED = "DED", // Dedent
    TAG = "TAG", // TOC ArticleGroup
    TSP = "TSP", // TOC SupplProvision
    TTL = "TTL", // Title
}

export type VirtualLineType = LineType | VirtualOnlyLineType;

export interface PhysicalLine {
    type: LineType | VirtualOnlyLineType.TAG | VirtualOnlyLineType.TSP | VirtualOnlyLineType.TTL;
    virtualRange: [start: number, end: number];
    virtualIndentDepth: number;
    line: Line;
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
//             } else if (nextLine.indentDepth <= line.indentDepth) {
//                 return nextLine.indentDepth;
//             } else {
//                 return line.indentDepth;
//             }
//         }
//         return line.indentDepth;
//     } else {
//         return line.indentDepth;
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
//             && (line.type === LineType.BNK || line.indentDepth <= inTOCDepth)
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
//                         line.indentDepth,
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
            && (line.type === LineType.BNK || line.indentDepth <= inTOCDepth)
        ) {
            inTOCDepth = null;
        }
        if (line.type === LineType.BNK) {
            type = line.type;
        } else if (line.type === LineType.TOC) {
            inTOCDepth = line.indentDepth;
            currentDepth = line.indentDepth;
            type = line.type;
        } else if (line.type === LineType.ARG || line.type === LineType.SPR) {
            if (inTOCDepth === null) {
                currentDepth = 0;
                type = line.type;
            } else {
                currentDepth = line.indentDepth;
                type = line.type === LineType.ARG ? VirtualOnlyLineType.TAG : VirtualOnlyLineType.TSP;
            }
        } else {
            currentDepth = line.indentDepth;
            type = line.type;
            if (isSingleParentheses(line)) {
                for (let currentOffset = i + 1; currentOffset < lines.length; currentOffset++) {
                    const nextLine = lines[currentOffset];
                    if (nextLine.type === LineType.BNK) continue;
                    if (
                        nextLine.indentDepth <= line.indentDepth
                        && (nextLine.type === LineType.ART || nextLine.type === LineType.PIT)
                    ) {
                        currentDepth = nextLine.indentDepth;
                        type = VirtualOnlyLineType.TTL;
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
        });
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
