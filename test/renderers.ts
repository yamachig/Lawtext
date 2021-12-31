import chai from "chai";
import fs from "fs";
import fsExtra from "fs-extra";
import { it } from "mocha";
import os from "os";
import path from "path";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import prettifyXml from "prettify-xml";
import { promisify } from "util";
import xmldom from "@xmldom/xmldom";
import { DiffStatus, DiffTableItemData, lawDiff, LawDiffElementChangeData, LawDiffElementMismatchData, LawDiffMode, LawDiffNoDiffData, LawDiffType, makeDiffData, ProblemStatus, TagType } from "../src/diff/law_diff";
import { parse } from "../src/parser";
import { analyze } from "../src/analyzer";
import { render as renderLawtext } from "../src/renderer/lawtext";
import { TERMC, toTableText } from "../src/util/term";
import * as util from "../src/util";
import { loader } from "./prepare_test";
import { outerXML, xmlToJson } from "../src/node/el";

const domParser = new xmldom.DOMParser();

const LIMIT_WIDTH = 34;

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

function* zipLongest<T>(lists: T[][], defaultValues: T[]) {
    if (lists.length !== defaultValues.length) throw new Error("Length mismatch");
    const maxLength = Math.max(...lists.map(list => list.length));
    for (let i = 0; i < maxLength; i++) {
        yield lists.map((list, li) => i < list.length ? list[i] : defaultValues[li]);
    }
}

const itemToString = (item: DiffTableItemData) => {
    if (item.type === TagType.Open) {
        if (Object.keys(item.attr).length) {
            return [
                `<${item.tag}`,
                ...Object.keys(item.attr).map(key => `  ${key}="${item.attr[key] ?? ""}"`),
                ">",
            ];
        } else {
            return [`<${item.tag}>`];
        }

    } else if (item.type === TagType.Empty) {
        if (Object.keys(item.attr).length) {
            return [
                `<${item.tag}`,
                ...Object.keys(item.attr).map(key => `  ${key}="${item.attr[key] ?? ""}"`),
                "/>",
            ];
        } else {
            return [`<${item.tag} />`];
        }

    } else if (item.type === TagType.Close) {
        return [`</${item.tag}>`];

    } else if (item.type === TagType.Text) {
        return [item.text];

    } else { throw util.assertNever(item.type); }
};

const makeElementMismatchTable = (ditem: LawDiffElementMismatchData) => {
    const table: string[][] = [];
    for (const drow of ditem.diffTable) {
        if (drow.status === DiffStatus.NoChange) {
            const oldItem = drow.oldItem;
            const newItem = drow.newItem;
            table.push(...zipLongest([
                [oldItem ? `  ${oldItem.pos ? oldItem.pos.str : ""}` : ""],
                itemToString(oldItem),
                [newItem ? `  ${newItem.pos ? newItem.pos.str : ""}` : ""],
                itemToString(newItem),
            ], ["", "", "", ""]));
        } else if (drow.status === DiffStatus.Change) {
            const oldItem = drow.oldItem;
            const newItem = drow.newItem;
            const color = ditem.mostSeriousStatus === ProblemStatus.Error ? TERMC.YELLOW : TERMC.CYAN;
            table.push(...zipLongest([
                oldItem ? [`${color}* ${oldItem.pos ? oldItem.pos.str : ""}${TERMC.DEFAULT}`] : [],
                oldItem ? itemToString(oldItem).map(s => `${color}${s}${TERMC.DEFAULT}`) : [],
                newItem ? [`${color}* ${newItem.pos ? newItem.pos.str : ""}${TERMC.DEFAULT}`] : [],
                newItem ? itemToString(newItem).map(s => `${color}${s}${TERMC.DEFAULT}`) : [],
            ], ["", "", "", ""]));
        } else if (drow.status === DiffStatus.Add) {
            const newItem = drow.newItem;
            const color = ditem.mostSeriousStatus === ProblemStatus.Error ? TERMC.GREEN : TERMC.CYAN;
            table.push(...zipLongest([
                [""],
                [""],
                [`${color}+ ${newItem.pos ? newItem.pos.str : ""}${TERMC.DEFAULT}`],
                itemToString(newItem).map(s => `${color}${s}${TERMC.DEFAULT}`),
            ], ["", "", "", ""]));
        } else if (drow.status === DiffStatus.Remove) {
            const oldItem = drow.oldItem;
            const color = ditem.mostSeriousStatus === ProblemStatus.Error ? TERMC.MAGENTA : TERMC.CYAN;
            table.push(...zipLongest([
                [`${color}- ${oldItem.pos ? oldItem.pos.str : ""}${TERMC.DEFAULT}`],
                itemToString(oldItem).map(s => `${color}${s}${TERMC.DEFAULT}`),
                [""],
                [""],
            ], ["", "", "", ""]));
        } else { util.assertNever(drow); }
    }

    return table;
};

const makeElementChangeTable = (ditem: LawDiffElementChangeData) => {
    const table: string[][] = [];
    const oldItem = ditem.oldItem;
    const newItem = ditem.newItem;

    if (ditem.mostSeriousStatus === ProblemStatus.Error) {
        table.push([
            `${TERMC.YELLOW}* ${oldItem.pos ? oldItem.pos.str : ""}${TERMC.DEFAULT}`,
            `<${oldItem.tag}`,
            `${TERMC.YELLOW}* ${newItem.pos ? newItem.pos.str : ""}${TERMC.DEFAULT}`,
            `<${newItem.tag}`,
        ]);
    } else if (ditem.mostSeriousStatus === ProblemStatus.Warning) {
        table.push([
            `${TERMC.CYAN}* ${oldItem.pos ? oldItem.pos.str : ""}${TERMC.DEFAULT}`,
            `<${oldItem.tag}`,
            `${TERMC.CYAN}* ${newItem.pos ? newItem.pos.str : ""}${TERMC.DEFAULT}`,
            `<${newItem.tag}`,
        ]);
    } else if (ditem.mostSeriousStatus === ProblemStatus.NoProblem) {
        table.push([
            `${TERMC.BLUE}* ${oldItem.pos ? oldItem.pos.str : ""}${TERMC.DEFAULT}`,
            `<${oldItem.tag}`,
            `${TERMC.BLUE}* ${newItem.pos ? newItem.pos.str : ""}${TERMC.DEFAULT}`,
            `<${newItem.tag}`,
        ]);
    } else { util.assertNever(ditem.mostSeriousStatus); }

    for (const key of ditem.nochangeKeys) {
        table.push([
            "",
            `  ${key}="${oldItem.attr[key] ?? ""}"`,
            "",
            `  ${key}="${newItem.attr[key] ?? ""}"`,
        ]);
    }

    for (const [key, status] of ditem.changedKeys) {
        if (status === ProblemStatus.Error) {
            table.push([
                "",
                `  ${key}="${TERMC.YELLOW}${oldItem.attr[key] ?? ""}${TERMC.DEFAULT}"`,
                "",
                `  ${key}="${TERMC.YELLOW}${newItem.attr[key] ?? ""}${TERMC.DEFAULT}"`,
            ]);
        } else if (status === ProblemStatus.Warning) {
            table.push([
                "",
                `  ${key}="${TERMC.CYAN}${oldItem.attr[key] ?? ""}${TERMC.DEFAULT}"`,
                "",
                `  ${key}="${TERMC.CYAN}${newItem.attr[key] ?? ""}${TERMC.DEFAULT}"`,
            ]);
        } else if (status === ProblemStatus.NoProblem) {
            table.push([
                "",
                `  ${key}="${TERMC.BLUE}${oldItem.attr[key] ?? ""}${TERMC.DEFAULT}"`,
                "",
                `  ${key}="${TERMC.BLUE}${newItem.attr[key] ?? ""}${TERMC.DEFAULT}"`,
            ]);
        } else { util.assertNever(status); }
    }

    for (const [key, status] of ditem.removedKeys) {
        if (status === ProblemStatus.Error) {
            table.push([
                "",
                `  ${TERMC.MAGENTA}${key}="${oldItem.attr[key] ?? ""}"${TERMC.DEFAULT}`,
                "",
                "",
            ]);
        } else if (status === ProblemStatus.Warning) {
            table.push([
                "",
                `  ${TERMC.CYAN}${key}="${oldItem.attr[key] ?? ""}"${TERMC.DEFAULT}`,
                "",
                "",
            ]);
        } else if (status === ProblemStatus.NoProblem) {
            table.push([
                "",
                `  ${TERMC.BLUE}${key}="${oldItem.attr[key] ?? ""}"${TERMC.DEFAULT}`,
                "",
                "",
            ]);
        } else { util.assertNever(status); }
    }

    for (const [key, status] of ditem.addedKeys) {
        if (status === ProblemStatus.Error) {
            table.push([
                "",
                "",
                "",
                `  ${TERMC.GREEN}${key}="${newItem.attr[key] ?? ""}"${TERMC.DEFAULT}`,
            ]);
        } else if (status === ProblemStatus.Warning) {
            table.push([
                "",
                "",
                "",
                `  ${TERMC.CYAN}${key}="${newItem.attr[key] ?? ""}"${TERMC.DEFAULT}`,
            ]);
        } else if (status === ProblemStatus.NoProblem) {
            table.push([
                "",
                "",
                "",
                `  ${TERMC.BLUE}${key}="${newItem.attr[key] ?? ""}"${TERMC.DEFAULT}`,
            ]);
        } else { util.assertNever(status); }
    }

    table.push(["", ">", "", ">"]);

    return table;
};

const NO_DIFF_SHOW_LINES = 3;

const makeElementNoDiffTable = (ditem: LawDiffNoDiffData) => {
    const table: string[][] = [];
    for (const [i, drow] of ditem.diffTable.entries()) {
        if (i < NO_DIFF_SHOW_LINES || ditem.diffTable.length - NO_DIFF_SHOW_LINES <= i) {
            if (drow.status !== DiffStatus.NoChange) throw new Error("never");
            const oldItem = drow.oldItem;
            const newItem = drow.newItem;

            table.push(...zipLongest([
                [oldItem ? `  ${oldItem.pos ? oldItem.pos.str : ""}` : ""],
                itemToString(oldItem),
                [newItem ? `  ${newItem.pos ? newItem.pos.str : ""}` : ""],
                itemToString(newItem),
            ], ["", "", "", ""]));
        } else if (i === NO_DIFF_SHOW_LINES && i < ditem.diffTable.length - NO_DIFF_SHOW_LINES) {
            table.push(["  ～～～", "～～～～～", "  ～～～", "～～～～～"]);
            table.push(["  ～～～", "～～～～～", "  ～～～", "～～～～～"]);
        }
    }

    return table;
};

it("Render and Parse Lawtext", async () => {
    // const [list, listByLawnum] = await getLawList();

    const lawNum = "平成二十六年政令第三百九十四号";

    const lawInfo = await loader.getLawInfoByLawNum(lawNum);
    if (lawInfo === null) throw Error("LawInfo not found");
    const origXML = await loader.loadLawXMLByInfo(lawInfo);
    if (origXML === null) throw new Error(`XML cannot be fetched: ${lawNum}`);
    console.log(`Temporary directory: "${tempDir}"`);
    const tempOrigXml = path.join(tempDir, `${lawNum}.orig.xml`);
    const tempRenderedLawtext = path.join(tempDir, `${lawNum}.rendered.law.txt`);
    const tempParsedXml = path.join(tempDir, `${lawNum}.parsed.xml`);
    await promisify(fsExtra.ensureDir)(tempDir);

    const origDOM = domParser.parseFromString(origXML);
    await promisify(fs.writeFile)(tempOrigXml, origXML, { encoding: "utf-8" });

    const origEL = xmlToJson(origXML);

    let lawtext;
    try {
        lawtext = renderLawtext(origEL);
    } catch (e) {
        const msg = [
            `Original XML: "${tempOrigXml}"`,
            "",
        ].join("\r\n");
        console.error(msg);
        throw e;
    }

    await promisify(fs.writeFile)(tempRenderedLawtext, lawtext, { encoding: "utf-8" });

    let parsedEL;
    try {
        parsedEL = parse(lawtext);
    } catch (e) {
        const msg = [
            `Original XML: "${tempOrigXml}"`,
            `Rendered Lawtext: "${tempRenderedLawtext}"`,
            "",
        ].join("\r\n");
        console.error(msg);
        throw e;
    }

    analyze(parsedEL);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const parsedXML = prettifyXml(outerXML(parsedEL)) as string;
    const parsedDOM = domParser.parseFromString(parsedXML);
    await promisify(fs.writeFile)(tempParsedXml, parsedXML, { encoding: "utf-8" });

    const d = lawDiff(origEL.json(false), (parsedEL.json(false)), LawDiffMode.WarningAsNoDiff);
    const table: string[][] = [];

    const diffData = makeDiffData(d, origDOM, parsedDOM);

    for (const ditem of diffData) {
        if (ditem.type === LawDiffType.ElementMismatch) {
            table.push(...makeElementMismatchTable(ditem));

        } else if (ditem.type === LawDiffType.ElementChange) {
            table.push(...makeElementChangeTable(ditem));

        } else if (ditem.type === LawDiffType.NoDiff) {
            table.push(...makeElementNoDiffTable(ditem));

        } else { util.assertNever(ditem); }
    }

    if (d.mostSeriousStatus !== ProblemStatus.NoProblem) {
        const legend = `Legend: Error(${TERMC.YELLOW}*Change${TERMC.DEFAULT}, ${TERMC.GREEN}+Add${TERMC.DEFAULT}, ${TERMC.MAGENTA}-Remove${TERMC.DEFAULT}), ${TERMC.CYAN}Warning${TERMC.DEFAULT}, ${TERMC.BLUE}NoProblem${TERMC.DEFAULT}`;
        const mssStr = (d.mostSeriousStatus === ProblemStatus.Error)
            ? `${TERMC.RED}Error${TERMC.DEFAULT}`
            : (d.mostSeriousStatus === ProblemStatus.Warning)
                ? `${TERMC.CYAN}Warning${TERMC.DEFAULT}`
                : util.assertNever(d.mostSeriousStatus);
        const msg = [
            legend,
            `Original XML: "${tempOrigXml}"`,
            `Rendered Lawtext: "${tempRenderedLawtext}"`,
            `Parsed XML: "${tempParsedXml}"`,
            `Most serious status: ${mssStr}`,
            toTableText(table, LIMIT_WIDTH),
            legend,
            `View XML: "${tempOrigXml}"`,
            `Rendered Lawtext: "${tempRenderedLawtext}"`,
            `Parsed XML: "${tempParsedXml}"`,
            `Most serious status: ${mssStr}`,
            "",
        ].join("\r\n");

        chai.assert(false, `\x1b\r\n\r\n[39m${msg}`);
    }

});
