import { it, before } from "mocha"
import * as chai from "chai"
import { render as renderLawtext } from "../src/renderers/lawtext"
import { parse, analyze } from "../src/parser_wrapper"
import * as util from "../src/util"
import { prepare, ensureList, getLawXml } from "./prepare_test";
import { lawDiff, LawDiffResult, LawDiffType, toTableText, ProblemStatus, withEllipsis, LawDiffElementChange, widthWOColor, DiffStatus, LawDiffElementMismatch, LawDiffNoDiff, TagType, TERMC } from "./util";
import * as os from "os";
import * as fs from "fs";
import * as fsExtra from "fs-extra";
import * as path from "path";
import { promisify } from "util";

before(() => {
    prepare();
    ensureList();
});

const LIMIT_WIDTH = 30;

const tempDir = path.join(os.tmpdir(), `lawtext_core_test`);

function makeElementMismatchTable(ditem: LawDiffElementMismatch<string>, d: LawDiffResult<string>, tempOrig: string) {
    const table: string[][] = [];
    for (const { oldItem, newItem, status } of ditem.diffTable) {
        if (status === DiffStatus.NoChange) {
            if (!oldItem || !newItem) throw new Error("never");
            table.push([
                0 <= oldItem.index ? `  ${oldItem.index.toString()}` : "",
                withEllipsis(`${oldItem.value}`, LIMIT_WIDTH),
                0 <= newItem.index ? `  ${newItem.index.toString()}` : "",
                withEllipsis(`${newItem.value}`, LIMIT_WIDTH),
            ]);
        } else if (status === DiffStatus.Change) {
            if (!oldItem || !newItem) throw new Error("never");
            table.push([
                `${TERMC.YELLOW}* ${oldItem.index.toString()}${TERMC.DEFAULT}`,
                `${TERMC.YELLOW}${oldItem.value}${TERMC.DEFAULT}`,
                `${TERMC.YELLOW}* ${newItem.index.toString()}${TERMC.DEFAULT}`,
                `${TERMC.YELLOW}${newItem.value}${TERMC.DEFAULT}`,
            ]);
        } else if (status === DiffStatus.Add) {
            if (!newItem) throw new Error("never");
            table.push([
                "",
                "",
                `${TERMC.GREEN}+ ${newItem.index.toString()}${TERMC.DEFAULT}`,
                `${TERMC.GREEN}${newItem.value}${TERMC.DEFAULT}`,
            ]);
        } else if (status === DiffStatus.Remove) {
            if (!oldItem) throw new Error("never");
            table.push([
                `${TERMC.RED}- ${oldItem.index.toString()}${TERMC.DEFAULT}`,
                `${TERMC.RED}${oldItem.value}${TERMC.DEFAULT}`,
                "",
                "",
            ]);
        } else { util.assertNever(status); }
    }

    return table;
}

function makeElementChangeTable(ditem: LawDiffElementChange<string>, d: LawDiffResult<string>, tempOrig: string) {
    const table: string[][] = [];
    const [[oldEL, /**/], [newEL, /**/]] = [d.oldELs[ditem.oldIndex], d.newELs[ditem.newIndex]];

    if (ditem.mostSeriousStatus === ProblemStatus.Error) {
        table.push([
            `${TERMC.YELLOW}* ${ditem.oldIndex}${TERMC.DEFAULT}`,
            `<${oldEL.tag}`,
            `${TERMC.YELLOW}* ${ditem.newIndex}${TERMC.DEFAULT}`,
            `<${newEL.tag}`,
        ]);
    } else if (ditem.mostSeriousStatus === ProblemStatus.Warning) {
        table.push([
            `${TERMC.CYAN}* ${ditem.oldIndex}${TERMC.DEFAULT}`,
            `<${oldEL.tag}`,
            `${TERMC.CYAN}* ${ditem.newIndex}${TERMC.DEFAULT}`,
            `<${newEL.tag}`,
        ]);
    } else if (ditem.mostSeriousStatus === ProblemStatus.NoProblem) {
        table.push([
            `${TERMC.BLUE}* ${ditem.oldIndex}${TERMC.DEFAULT}`,
            `<${oldEL.tag}`,
            `${TERMC.BLUE}* ${ditem.newIndex}${TERMC.DEFAULT}`,
            `<${newEL.tag}`,
        ]);
    } else { util.assertNever(ditem.mostSeriousStatus); }

    for (let key of ditem.nochangeKeys) {
        table.push([
            "", `  ${key}="${oldEL.attr[key]}"`,
            "", `  ${key}="${newEL.attr[key]}"`,
        ]);
    }

    for (let [key, status] of ditem.changedKeys) {
        if (status === ProblemStatus.Error) {
            table.push([
                "", `  ${key}="${TERMC.YELLOW}${oldEL.attr[key]}${TERMC.DEFAULT}"`,
                "", `  ${key}="${TERMC.YELLOW}${newEL.attr[key]}${TERMC.DEFAULT}"`,
            ]);
        } else if (status === ProblemStatus.Warning) {
            table.push([
                "", `  ${key}="${TERMC.CYAN}${oldEL.attr[key]}${TERMC.DEFAULT}"`,
                "", `  ${key}="${TERMC.CYAN}${newEL.attr[key]}${TERMC.DEFAULT}"`,
            ]);
        } else if (status === ProblemStatus.NoProblem) {
            table.push([
                "", `  ${key}="${TERMC.BLUE}${oldEL.attr[key]}${TERMC.DEFAULT}"`,
                "", `  ${key}="${TERMC.BLUE}${newEL.attr[key]}${TERMC.DEFAULT}"`,
            ]);
        } else { util.assertNever(status); }
    }

    for (let [key, status] of ditem.removedKeys) {
        if (status === ProblemStatus.Error) {
            table.push([
                "", `  ${TERMC.YELLOW}${key}="${oldEL.attr[key]}"${TERMC.DEFAULT}`,
                "", "",
            ]);
        } else if (status === ProblemStatus.Warning) {
            table.push([
                "", `  ${TERMC.CYAN}${key}="${oldEL.attr[key]}"${TERMC.DEFAULT}`,
                "", "",
            ]);
        } else if (status === ProblemStatus.NoProblem) {
            table.push([
                "", `  ${TERMC.BLUE}${key}="${oldEL.attr[key]}"${TERMC.DEFAULT}`,
                "", "",
            ]);
        } else { util.assertNever(status); }
    }

    for (let [key, status] of ditem.addedKeys) {
        if (status === ProblemStatus.Error) {
            table.push([
                "", "",
                "", `  ${TERMC.YELLOW}${key}="${newEL.attr[key]}"${TERMC.DEFAULT}`,
            ]);
        } else if (status === ProblemStatus.Warning) {
            table.push([
                "", "",
                "", `  ${TERMC.CYAN}${key}="${newEL.attr[key]}"${TERMC.DEFAULT}`,
            ]);
        } else if (status === ProblemStatus.NoProblem) {
            table.push([
                "", "",
                "", `  ${TERMC.BLUE}${key}="${newEL.attr[key]}"${TERMC.DEFAULT}`,
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
                    return withEllipsis(`${el.text}`, LIMIT_WIDTH);

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

    const d = lawDiff(origEL.json(false), (parsedEL.json(false)), true);
    const table: string[][] = [];

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
            toTableText(table, LIMIT_WIDTH),
            `View XML: "${tempOrig}"`,
            "",
        ].join("\r\n");

        chai.assert(false, `\x1b\r\n\r\n[39m${msg}`);
    }

});
