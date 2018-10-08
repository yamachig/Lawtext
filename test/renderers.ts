import { it, before } from "mocha"
import * as chai from "chai"
import { render as renderLawtext } from "../src/renderers/lawtext"
import { parse, analyze } from "../src/parser_wrapper"
import * as util from "../src/util"
import { prepare, ensureList, getLawXml } from "./prepare_test";
import { lawDiff, LawDiffMode, LawDiffResult, LawDiffType, ProblemStatus, LawDiffElementChange, DiffStatus, LawDiffElementMismatch, LawDiffNoDiff, TagType, ComparableEL } from "../src/diff/law_diff";
import { toTableText, TERMC } from "../src/term_util";
import * as os from "os";
import * as fs from "fs";
import * as fsExtra from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import * as xmldom from "xmldom";
import * as xpath from "xpath";
import * as prettifyXml from "prettify-xml"

const domParser = new xmldom.DOMParser();

before(() => {
    prepare();
    ensureList();
});

const LIMIT_WIDTH = 34;

const tempDir = path.join(os.tmpdir(), `lawtext_core_test`);

function zipLongest<T>(lists: T[][], defaultValues: T[]): IterableIterator<T[]>;
function* zipLongest(lists: any[][], defaultValues: any[]) {
    if (lists.length !== defaultValues.length) throw new Error("Length mismatch");
    const maxLength = Math.max(...lists.map(list => list.length));
    for (let i = 0; i < maxLength; i++) {
        yield lists.map((list, li) => i < list.length ? list[i] : defaultValues[li]);
    }
}

function elToString([el, tt]: [ComparableEL, TagType]) {
    if (tt === TagType.Open) {
        if (Object.keys(el.attr).length) {
            return [
                `<${el.tag}`,
                ...Object.keys(el.attr).map(key => `  ${key}="${el.attr[key]}"`),
                ">"
            ];
        } else {
            return [`<${el.tag}>`];
        }

    } else if (tt === TagType.Empty) {
        if (Object.keys(el.attr).length) {
            return [
                `<${el.tag}`,
                ...Object.keys(el.attr).map(key => `  ${key}="${el.attr[key]}"`),
                "/>"
            ];
        } else {
            return [`<${el.tag} />`];
        }

    } else if (tt === TagType.Close) {
        return [`</${el.tag}>`];

    } else if (tt === TagType.Text) {
        return [el.text];

    } else { throw util.assertNever(tt); }
}

function getPosition([el, tt]: [ComparableEL, TagType], dom: Node) {
    let xPathString: string | null = null;
    if (tt === TagType.Open) {
        xPathString = el.getXPath();

    } else if (tt === TagType.Empty) {
        xPathString = el.getXPath();

    } else if (tt === TagType.Close) {
        xPathString = el.getXPath();

    } else if (tt === TagType.Text) {
        if (el.parent) {
            xPathString = el.parent.getXPath();
        }

    } else { throw util.assertNever(tt); }

    if (xPathString) {
        try {
            const r = xpath.evaluate(
                xPathString,
                dom,
                (xpath as any).createNSResolver(dom),
                (xpath as any).XPathResult.ANY_TYPE,
                null as any,
            ) as any;
            const el = r.nodes[0];
            return { line: el.lineNumber, col: el.columnNumber, str: `${el.lineNumber}:${el.columnNumber}` };
        } catch (e) {
            console.error(e);
            console.error(xPathString);
            return null;
        }
    } else {
        return null;
    }
}

function makeElementMismatchTable(ditem: LawDiffElementMismatch<string>, d: LawDiffResult<string>, origDOM: Node, parsedDOM: Node) {
    const table: string[][] = [];
    for (const drow of ditem.diffTable) {
        if (drow.status === DiffStatus.NoChange) {
            const oldItem = d.oldELs[drow.oldItem.index];
            const newItem = d.newELs[drow.newItem.index];
            const oldPos = getPosition(oldItem, origDOM);
            const newPos = getPosition(newItem, parsedDOM);
            table.push(...zipLongest([
                [0 <= drow.oldItem.index ? `  ${oldPos ? oldPos.str : ""}` : ""],
                elToString(oldItem),
                [0 <= drow.newItem.index ? `  ${newPos ? newPos.str : ""}` : ""],
                elToString(newItem),
            ], ["", "", "", ""]));
        } else if (drow.status === DiffStatus.Change) {
            const oldItem = drow.oldItem && d.oldELs[drow.oldItem.index];
            const newItem = drow.newItem && d.newELs[drow.newItem.index];
            const oldPos = oldItem && getPosition(oldItem, origDOM);
            const newPos = newItem && getPosition(newItem, parsedDOM);
            const color = ditem.mostSeriousStatus === ProblemStatus.Error ? TERMC.YELLOW : TERMC.CYAN;
            table.push(...zipLongest([
                oldPos ? [`${color}* ${oldPos ? oldPos.str : ""}${TERMC.DEFAULT}`] : [],
                oldItem ? elToString(oldItem).map(s => `${color}${s}${TERMC.DEFAULT}`) : [],
                newPos ? [`${color}* ${newPos ? newPos.str : ""}${TERMC.DEFAULT}`] : [],
                newItem ? elToString(newItem).map(s => `${color}${s}${TERMC.DEFAULT}`) : [],
            ], ["", "", "", ""]));
        } else if (drow.status === DiffStatus.Add) {
            const newItem = d.newELs[drow.newItem.index];
            const newPos = getPosition(newItem, parsedDOM);
            const color = ditem.mostSeriousStatus === ProblemStatus.Error ? TERMC.GREEN : TERMC.CYAN;
            table.push(...zipLongest([
                [""],
                [""],
                [`${color}+ ${newPos ? newPos.str : ""}${TERMC.DEFAULT}`],
                elToString(newItem).map(s => `${color}${s}${TERMC.DEFAULT}`),
            ], ["", "", "", ""]));
        } else if (drow.status === DiffStatus.Remove) {
            const oldItem = d.oldELs[drow.oldItem.index];
            const oldPos = getPosition(oldItem, origDOM);
            const color = ditem.mostSeriousStatus === ProblemStatus.Error ? TERMC.MAGENTA : TERMC.CYAN;
            table.push(...zipLongest([
                [`${color}- ${oldPos ? oldPos.str : ""}${TERMC.DEFAULT}`],
                elToString(oldItem).map(s => `${color}${s}${TERMC.DEFAULT}`),
                [""],
                [""],
            ], ["", "", "", ""]));
        } else { util.assertNever(drow); }
    }

    return table;
}

function makeElementChangeTable(ditem: LawDiffElementChange<string>, d: LawDiffResult<string>, origDOM: Node, parsedDOM: Node) {
    const table: string[][] = [];
    const [oldItem, newItem] = [d.oldELs[ditem.oldIndex], d.newELs[ditem.newIndex]];
    const [[oldEL, /**/], [newEL, /**/]] = [oldItem, newItem];
    const oldPos = getPosition(oldItem, origDOM);
    const newPos = getPosition(newItem, parsedDOM);

    if (ditem.mostSeriousStatus === ProblemStatus.Error) {
        table.push([
            `${TERMC.YELLOW}* ${oldPos ? oldPos.str : ""}${TERMC.DEFAULT}`,
            `<${oldEL.tag}`,
            `${TERMC.YELLOW}* ${newPos ? newPos.str : ""}${TERMC.DEFAULT}`,
            `<${newEL.tag}`,
        ]);
    } else if (ditem.mostSeriousStatus === ProblemStatus.Warning) {
        table.push([
            `${TERMC.CYAN}* ${oldPos ? oldPos.str : ""}${TERMC.DEFAULT}`,
            `<${oldEL.tag}`,
            `${TERMC.CYAN}* ${newPos ? newPos.str : ""}${TERMC.DEFAULT}`,
            `<${newEL.tag}`,
        ]);
    } else if (ditem.mostSeriousStatus === ProblemStatus.NoProblem) {
        table.push([
            `${TERMC.BLUE}* ${oldPos ? oldPos.str : ""}${TERMC.DEFAULT}`,
            `<${oldEL.tag}`,
            `${TERMC.BLUE}* ${newPos ? newPos.str : ""}${TERMC.DEFAULT}`,
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
                "", `  ${TERMC.MAGENTA}${key}="${oldEL.attr[key]}"${TERMC.DEFAULT}`,
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
                "", `  ${TERMC.GREEN}${key}="${newEL.attr[key]}"${TERMC.DEFAULT}`,
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

const NO_DIFF_SHOW_LINES = 3;

function makeElementNoDiffTable(ditem: LawDiffNoDiff<string>, d: LawDiffResult<string>, origDOM: Node, parsedDOM: Node) {
    const table: string[][] = [];
    for (const [i, drow] of ditem.diffTable.entries()) {
        if (i < NO_DIFF_SHOW_LINES || ditem.diffTable.length - NO_DIFF_SHOW_LINES <= i) {
            if (drow.status !== DiffStatus.NoChange) throw new Error("never");
            const oldItem = d.oldELs[drow.oldItem.index];
            const newItem = d.newELs[drow.newItem.index];
            const oldPos = getPosition(oldItem, origDOM);
            const newPos = getPosition(newItem, parsedDOM);

            table.push(...zipLongest([
                [0 <= drow.oldItem.index ? `  ${oldPos ? oldPos.str : ""}` : ""],
                elToString(oldItem),
                [0 <= drow.newItem.index ? `  ${newPos ? newPos.str : ""}` : ""],
                elToString(newItem),
            ], ["", "", "", ""]));
        } else if (i == NO_DIFF_SHOW_LINES && i < ditem.diffTable.length - NO_DIFF_SHOW_LINES) {
            table.push(["  ～～～", "～～～～～", "  ～～～", "～～～～～"]);
            table.push(["  ～～～", "～～～～～", "  ～～～", "～～～～～"]);
        }
    }

    return table;
}

it("Render and Parse Lawtext", async () => {
    // const [list, listByLawnum] = await getLawList();

    const lawNum = "昭和二十五年電波監理委員会規則第十八号";

    const origXML = await getLawXml(lawNum);
    console.log(`Temporary directory: "${tempDir}"`);
    const tempOrigXml = path.join(tempDir, `${lawNum}.orig.xml`);
    const tempRenderedLawtext = path.join(tempDir, `${lawNum}.rendered.law.txt`);
    const tempParsedXml = path.join(tempDir, `${lawNum}.parsed.xml`);
    await promisify(fsExtra.ensureDir)(tempDir);

    const origDOM = domParser.parseFromString(origXML);
    await promisify(fs.writeFile)(tempOrigXml, origXML, { encoding: "utf-8" });

    const origEL = util.xml_to_json(origXML);

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

    const parsedXML = prettifyXml(util.outerXML(parsedEL)) as string;
    const parsedDOM = domParser.parseFromString(parsedXML);
    await promisify(fs.writeFile)(tempParsedXml, parsedXML, { encoding: "utf-8" });

    const d = lawDiff(origEL.json(false), (parsedEL.json(false)), LawDiffMode.WarningAsNoDiff);
    const table: string[][] = [];

    for (const ditem of d.items) {
        if (ditem.type === LawDiffType.ElementMismatch) {
            table.push(...makeElementMismatchTable(ditem, d, origDOM, parsedDOM));

        } else if (ditem.type === LawDiffType.ElementChange) {
            table.push(...makeElementChangeTable(ditem, d, origDOM, parsedDOM));

        } else if (ditem.type === LawDiffType.NoDiff) {
            table.push(...makeElementNoDiffTable(ditem, d, origDOM, parsedDOM));

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
