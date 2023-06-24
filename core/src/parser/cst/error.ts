/* eslint-disable no-irregular-whitespace */
// import { wrapSingle } from "../../util/term";

// export const sliceLinesWithNumbers = (
//     allLines: string[],
//     start: {offset: number, line: number, column: number},
//     end: {offset: number, line: number, column: number},
//     maxWidth: number,
// ) => {
//     const ls: string[] = [];
//     const digits = Math.floor(Math.log10(end.line)) + 1;
//     for (let i = Math.max(1, start.line - 2); i <= Math.min(allLines.length, end.line + 2); i++) {
//         let line = allLines[i - 1];
//         if (i === end.line) {
//             line = line.slice(0, end.column - 1) + "◂" + line.slice(end.column - 1);
//         }
//         if (i === start.line) {
//             line = line.slice(0, start.column - 1) + "▸" + line.slice(start.column - 1);
//         }
//         // eslint-disable-next-line no-irregular-whitespace
//         const mIndent = /^ */.exec(line.replace(/　/g, "  "));
//         const indentWidth = mIndent ? mIndent[0].length : 0;
//         // eslint-disable-next-line no-irregular-whitespace
//         line = line.replace(/ /g, "･").replace(/　/g, "⬚");
//         const wrapLines = Array.from(wrapSingle(line, maxWidth, indentWidth + 2));

//         for (const [j, wrapLine] of wrapLines.entries()) {
//             ls.push(`${(j === 0 ? i.toString() : "").padStart(digits, " ")}│${j === 0 ? "" : "".padStart(indentWidth + 2, " ")}${wrapLine}`);
//         }
//     }
//     return ls.join("\n");
// };

export class ErrorMessage {
    public constructor(
        public message: string,
        public range: [start: number, end: number],
    ) {}

//     public toString(
//         allLines: string[],
//         maxWidth = 70,
//     ): string {
//         return `\
// Error: ${this.message}
// ${sliceLinesWithNumbers(allLines, ...this.range, maxWidth)}`;
//     }
}
