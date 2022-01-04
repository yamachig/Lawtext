import { Line, LineType } from "../../node/cst/line";
import { isSingleParentheses } from "./util";

export interface PhysicalLine {
    type: "PhysicalLine";
    virtualIndentDepth: number;
    line: Line;
}

export interface Indent {
    type: "Indent";
}

export interface Dedent {
    type: "Dedent";
}

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
        let currentDepth = virtualIndentDepth;
        if (
            inTOCDepth !== null
            && (line.type === LineType.BNK || line.indentDepth <= inTOCDepth)
        ) {
            inTOCDepth = null;
        }
        if (line.type === LineType.BNK) {
            /**/
        } else if (line.type === LineType.TOC) {
            inTOCDepth = line.indentDepth;
            currentDepth = line.indentDepth;
        } else if (line.type === LineType.ARG || line.type === LineType.SPR) {
            currentDepth = inTOCDepth === null ? 0 : line.indentDepth;
        } else {
            currentDepth = line.indentDepth;
            if (isSingleParentheses(line)) {
                for (let currentOffset = i + 1; currentOffset < lines.length; currentOffset++) {
                    const nextLine = lines[currentOffset];
                    if (nextLine.type === LineType.BNK) continue;
                    if (nextLine.indentDepth <= line.indentDepth) {
                        currentDepth = nextLine.indentDepth;
                    }
                    break;
                }
            }
        }
        while (virtualIndentDepth < currentDepth) {
            virtualLines.push({
                type: "Indent",
            });
            virtualIndentDepth++;
        }
        while (currentDepth < virtualIndentDepth) {
            virtualLines.push({
                type: "Dedent",
            });
            virtualIndentDepth--;
        }
        virtualLines.push({
            type: "PhysicalLine",
            virtualIndentDepth,
            line,
        });
    }
    while (0 < virtualIndentDepth) {
        virtualLines.push({
            type: "Dedent",
        });
        virtualIndentDepth--;
    }
    return virtualLines;
};
