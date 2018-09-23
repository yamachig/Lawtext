import { describe, it, before } from "mocha"
import * as chai from "chai"
import { render as renderLawtext } from "../src/renderers/lawtext"
import { parse, analyze } from "../src/parser_wrapper"
import * as util from "../src/util"
import { prepare, getLawList, ensureList, getLawXml } from "./prepare_test";
import { lawDiff, LawDiffResult, LawDiffType, toTableText, ProblemStatus, withEllipsis, LawDiffElementChange, collapseChange, collapseNoChange, DiffStatus, LawDiffElementMismatch, LawDiffNoDiff, TagType } from "./util";
import * as os from "os";
import * as fs from "fs";
import * as fsExtra from "fs-extra";
import * as path from "path";
import { promisify } from "util";

before(() => {
    prepare();
    ensureList();
});

const tempDir = path.join(os.tmpdir(), `lawtext_core_test`);

function* wrap(row: string[], width = 20): IterableIterator<string[]> {
    let pos = 0;
    while (row.some(s => pos < s.length)) {
        yield row.map(s => s.slice(pos, pos + width));
        pos += width;
    }
}

function makeElementMismatchTable(ditem: LawDiffElementMismatch<string>, d: LawDiffResult<string>, tempOrig: string) {
    const table: [string, string, string, string][] = [];
    for (const { oldItem, newItem, status } of ditem.diffTable) {
        if (status === DiffStatus.NoChange) {
            if (!oldItem || !newItem) throw new Error("never");
            table.push([
                0 <= oldItem.index ? `  ${oldItem.index.toString()}` : "",
                withEllipsis(`${oldItem.value}`, 20),
                0 <= newItem.index ? `  ${newItem.index.toString()}` : "",
                withEllipsis(`${newItem.value}`, 20),
            ]);
        } else if (status === DiffStatus.Change) {
            Array.from(wrap([
                oldItem && `${oldItem.value}` || "",
                newItem && `${newItem.value}` || "",
            ])).forEach(([oldStr, newStr], i) => {
                table.push([
                    !i && oldItem && `\x1b[33m* ${oldItem.index.toString()}\x1b[39m` || "",
                    `\x1b[33m${oldStr}\x1b[39m`,
                    !i && newItem && `\x1b[33m* ${newItem.index.toString()}\x1b[39m` || "",
                    `\x1b[33m${newStr}\x1b[39m`,
                ]);
            });
        } else if (status === DiffStatus.Add) {
            if (!newItem) throw new Error("never");
            Array.from(wrap([
                `${newItem.value}`,
            ])).forEach(([newStr], i) => {
                table.push([
                    "",
                    "",
                    !i ? `\x1b[32m+ ${newItem.index.toString()}\x1b[39m` : "",
                    `\x1b[32m${newStr}\x1b[39m`,
                ]);
            });
        } else if (status === DiffStatus.Remove) {
            if (!oldItem) {
                console.log(oldItem, newItem);
                throw new Error("never");
            }
            Array.from(wrap([
                `${oldItem.value}`,
            ])).forEach(([oldStr], i) => {
                table.push([
                    !i ? `\x1b[31m- ${oldItem.index.toString()}\x1b[39m` : "",
                    `\x1b[31m${oldStr}\x1b[39m`,
                    "",
                    "",
                ]);
            });
        } else { util.assertNever(status); }
    }

    return table;
}

function makeElementChangeTable(ditem: LawDiffElementChange<string>, d: LawDiffResult<string>, tempOrig: string) {
    let errMsg = "";

    const table: [string, string, string, string][] = [];
    const [[oldEL, /**/], [newEL, /**/]] = [d.oldELs[ditem.oldIndex], d.newELs[ditem.newIndex]];

    table.push([
        `\x1b[33m* ${ditem.oldIndex}\x1b[39m`,
        `<${oldEL.tag}`,
        `\x1b[33m* ${ditem.newIndex}\x1b[39m`,
        `<${newEL.tag}`,
    ]);

    for (let key of ditem.nochangeKeys) {
        table.push([
            "", `  ${key}="${oldEL.attr[key]}"`,
            "", `  ${key}="${newEL.attr[key]}"`,
        ]);
    }

    for (let [key, status] of ditem.changedKeys) {
        if (status === ProblemStatus.Error) {
            table.push([
                "", `  ${key}="\x1b[31m${oldEL.attr[key]}\x1b[39m"`,
                "", `  ${key}="\x1b[31m${newEL.attr[key]}\x1b[39m"`,
            ]);
        } else if (status === ProblemStatus.Warning) {
            table.push([
                "", `  ${key}="\x1b[33m${oldEL.attr[key]}\x1b[39m"`,
                "", `  ${key}="\x1b[33m${newEL.attr[key]}\x1b[39m"`,
            ]);
        } else if (status === ProblemStatus.NoProblem) {
            table.push([
                "", `  ${key}="\x1b[34m${oldEL.attr[key]}\x1b[39m"`,
                "", `  ${key}="\x1b[34m${newEL.attr[key]}\x1b[39m"`,
            ]);
        } else { util.assertNever(status); }
    }

    for (let [key, status] of ditem.removedKeys) {
        if (status === ProblemStatus.Error) {
            table.push([
                "", `  \x1b[31m${key}="${oldEL.attr[key]}"\x1b[39m`,
                "", "",
            ]);
        } else if (status === ProblemStatus.Warning) {
            table.push([
                "", `  \x1b[33m${key}="${oldEL.attr[key]}"\x1b[39m`,
                "", "",
            ]);
        } else if (status === ProblemStatus.NoProblem) {
            table.push([
                "", `  \x1b[34m${key}="${oldEL.attr[key]}"\x1b[39m`,
                "", "",
            ]);
        } else { util.assertNever(status); }
    }

    for (let [key, status] of ditem.addedKeys) {
        if (status === ProblemStatus.Error) {
            table.push([
                "", "",
                "", `  \x1b[31m${key}="${newEL.attr[key]}"\x1b[39m`,
            ]);
        } else if (status === ProblemStatus.Warning) {
            table.push([
                "", "",
                "", `  \x1b[33m${key}="${newEL.attr[key]}"\x1b[39m`,
            ]);
        } else if (status === ProblemStatus.NoProblem) {
            table.push([
                "", "",
                "", `  \x1b[34m${key}="${newEL.attr[key]}"\x1b[39m`,
            ]);
        } else { util.assertNever(status); }
    }

    table.push(["", `>`, "", `>`]);

    return table;
}

function makeElementNoDiffTable(ditem: LawDiffNoDiff<string>, d: LawDiffResult<string>, tempOrig: string) {
    const table: [string, string, string, string][] = [];
    for (const [i, { oldItem, newItem, status }] of ditem.diffTable.entries()) {
        if (i < 2 || ditem.diffTable.length - 2 <= i) {
            if (!oldItem || !newItem) throw new Error("never");

            const [oldText, newText] = [d.oldELs[oldItem.index], d.newELs[newItem.index]].map(([el, tt]) => {
                if (tt === TagType.Open) {
                    return `<${el.tag} ...>`;

                } else if (tt === TagType.Close) {
                    return `</${el.tag}>`;

                } else if (tt === TagType.Empty) {
                    return `<${el.tag} ... />`;

                } else if (tt === TagType.Text) {
                    return withEllipsis(`${el.text}`, 20);

                } else { throw util.assertNever(tt) };
            });
            table.push([
                0 <= oldItem.index ? `  ${oldItem.index.toString()}` : "",
                oldText,
                0 <= newItem.index ? `  ${newItem.index.toString()}` : "",
                newText,
            ]);
        } else if (i == 2 && i < ditem.diffTable.length - 2) {
            table.push(["  ：", "：", "  ：", "："]);
        }
    }

    return table;
}

it("Render and Parse Lawtext", async () => {
    // const [list, listByLawnum] = await getLawList();

    const lawNum = "昭和二十五年法律第百三十一号";

    const xml = await getLawXml(lawNum);
    await promisify(fsExtra.ensureDir)(tempDir);
    const tempOrig = path.join(tempDir, `${lawNum}.orig.xml`);
    await promisify(fs.writeFile)(tempOrig, xml, { encoding: "utf-8" });

    const origEL = util.xml_to_json(xml);
    const lawtext = renderLawtext(origEL);
    const parsedEL = parse(lawtext);
    analyze(parsedEL);

    const d = lawDiff(origEL.json(false), (parsedEL.json(false)));
    const table: [string, string, string, string][] = [];

    for (const ditem of d.items) {
        if (ditem.type === LawDiffType.ElementMismatch) {
            table.push(...makeElementMismatchTable(ditem, d, tempOrig));

        } else if (ditem.type === LawDiffType.ElementChange) {
            table.push(...makeElementChangeTable(ditem, d, tempOrig));

        } else if (ditem.type === LawDiffType.NoDiff) {
            table.push(...makeElementNoDiffTable(ditem, d, tempOrig));

        } else { util.assertNever(ditem); }
    }

    if (d.mostSeriousStatus !== ProblemStatus.NoProblem) {
        const msg = [
            `View XML: "${tempOrig}"`,
            toTableText(table),
            `View XML: "${tempOrig}"`,
            "",
        ].join("\r\n");

        chai.assert(false, `\x1b\r\n\r\n[39m${msg}`);
    }

});
