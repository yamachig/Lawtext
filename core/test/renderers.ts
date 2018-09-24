import { it, before } from "mocha"
import * as chai from "chai"
import { render as renderLawtext } from "../src/renderers/lawtext"
import { parse, analyze } from "../src/parser_wrapper"
import * as util from "../src/util"
import { prepare, ensureList, getLawXml } from "./prepare_test";
import { lawDiff, LawDiffResult, LawDiffType, ProblemStatus, LawDiffElementChange, DiffStatus, LawDiffElementMismatch, LawDiffNoDiff, TagType, DiffTableItem, ComparableEL } from "../src/diff/law_diff";
import { toTableText, withEllipsis, TERMC } from "../src/term_util";
import * as os from "os";
import * as fs from "fs";
import * as fsExtra from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import * as xmldom from "xmldom";
import * as xpath from "xpath";

const domParser = new xmldom.DOMParser();

before(() => {
    prepare();
    ensureList();
});

const LIMIT_WIDTH = 34;

const tempDir = path.join(os.tmpdir(), `lawtext_core_test`);

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

function makeElementMismatchTable(ditem: LawDiffElementMismatch<string>, d: LawDiffResult<string>, origDOM: Node) {
    const table: string[][] = [];
    for (const drow of ditem.diffTable) {
        if (drow.status === DiffStatus.NoChange) {
            const oldItem = d.oldELs[drow.oldItem.index];
            const newItem = d.newELs[drow.newItem.index];
            const oldPos = getPosition(oldItem, origDOM);
            table.push(...zipLongest([
                [0 <= drow.oldItem.index ? `  ${oldPos ? oldPos.str : ""}` : ""],
                elToString(oldItem),
                [0 <= drow.newItem.index ? `  ${drow.newItem.index.toString()}` : ""],
                elToString(newItem),
            ], ["", "", "", ""]));
        } else if (drow.status === DiffStatus.Change) {
            const oldEL = d.oldELs[drow.oldItem.index];
            const newEL = d.newELs[drow.newItem.index];
            const oldPos = getPosition(oldEL, origDOM);
            const color = ditem.mostSeriousStatus === ProblemStatus.Error ? TERMC.YELLOW : TERMC.BLUE;
            table.push(...zipLongest([
                [`${color}* ${oldPos ? oldPos.str : ""}${TERMC.DEFAULT}`],
                elToString(oldEL).map(s => `${color}${s}${TERMC.DEFAULT}`),
                [`${color}* ${drow.newItem.index.toString()}${TERMC.DEFAULT}`],
                elToString(newEL).map(s => `${color}${s}${TERMC.DEFAULT}`),
            ], ["", "", "", ""]));
        } else if (drow.status === DiffStatus.Add) {
            const newEL = d.newELs[drow.newItem.index];
            const color = ditem.mostSeriousStatus === ProblemStatus.Error ? TERMC.GREEN : TERMC.BLUE;
            table.push(...zipLongest([
                [""],
                [""],
                [`${color}+ ${drow.newItem.index.toString()}${TERMC.DEFAULT}`],
                elToString(newEL).map(s => `${color}${s}${TERMC.DEFAULT}`),
            ], ["", "", "", ""]));
        } else if (drow.status === DiffStatus.Remove) {
            const oldEL = d.oldELs[drow.oldItem.index];
            const oldPos = getPosition(oldEL, origDOM);
            const color = ditem.mostSeriousStatus === ProblemStatus.Error ? TERMC.MAGENTA : TERMC.BLUE;
            table.push(...zipLongest([
                [`${color}- ${oldPos ? oldPos.str : ""}${TERMC.DEFAULT}`],
                elToString(oldEL).map(s => `${color}${s}${TERMC.DEFAULT}`),
                [""],
                [""],
            ], ["", "", "", ""]));
        } else { util.assertNever(drow); }
    }

    return table;
}

function makeElementChangeTable(ditem: LawDiffElementChange<string>, d: LawDiffResult<string>, origDOM: Node) {
    const table: string[][] = [];
    const [oldItem, newItem] = [d.oldELs[ditem.oldIndex], d.newELs[ditem.newIndex]];
    const [[oldEL, /**/], [newEL, /**/]] = [oldItem, newItem];
    const oldPos = getPosition(oldItem, origDOM);

    if (ditem.mostSeriousStatus === ProblemStatus.Error) {
        table.push([
            `${TERMC.YELLOW}* ${oldPos ? oldPos.str : ""}${TERMC.DEFAULT}`,
            `<${oldEL.tag}`,
            `${TERMC.YELLOW}* ${ditem.newIndex}${TERMC.DEFAULT}`,
            `<${newEL.tag}`,
        ]);
    } else if (ditem.mostSeriousStatus === ProblemStatus.Warning) {
        table.push([
            `${TERMC.CYAN}* ${oldPos ? oldPos.str : ""}${TERMC.DEFAULT}`,
            `<${oldEL.tag}`,
            `${TERMC.CYAN}* ${ditem.newIndex}${TERMC.DEFAULT}`,
            `<${newEL.tag}`,
        ]);
    } else if (ditem.mostSeriousStatus === ProblemStatus.NoProblem) {
        table.push([
            `${TERMC.BLUE}* ${oldPos ? oldPos.str : ""}${TERMC.DEFAULT}`,
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

function makeElementNoDiffTable(ditem: LawDiffNoDiff<string>, d: LawDiffResult<string>, origDOM: Node) {
    const table: string[][] = [];
    for (const [i, drow] of ditem.diffTable.entries()) {
        if (i < 2 || ditem.diffTable.length - 2 <= i) {
            if (drow.status !== DiffStatus.NoChange) throw new Error("never");
            const oldItem = d.oldELs[drow.oldItem.index];
            const newItem = d.newELs[drow.newItem.index];
            const oldPos = getPosition(oldItem, origDOM);

            table.push(...zipLongest([
                [0 <= drow.oldItem.index ? `  ${oldPos ? oldPos.str : ""}` : ""],
                elToString(oldItem),
                [0 <= drow.newItem.index ? `  ${drow.newItem.index.toString()}` : ""],
                elToString(newItem),
            ], ["", "", "", ""]));
        } else if (i == 2 && i < ditem.diffTable.length - 2) {
            table.push(["  ～～～", "～～～～～", "  ～～～", "～～～～～"]);
            table.push(["  ～～～", "～～～～～", "  ～～～", "～～～～～"]);
        }
    }

    return table;
}

it("Render and Parse Lawtext", async () => {
    // const [list, listByLawnum] = await getLawList();

    const lawNum = "昭和二十五年法律第百三十一号";

    const xml = await getLawXml(lawNum);
    const tempOrigXml = path.join(tempDir, `${lawNum}.orig.xml`);

    const origDOM = domParser.parseFromString(xml);

    await promisify(fsExtra.ensureDir)(tempDir);
    await promisify(fs.writeFile)(tempOrigXml, xml, { encoding: "utf-8" });

    const origEL = util.xml_to_json(xml);
    const lawtext = renderLawtext(origEL);
    const parsedEL = parse(lawtext);
    analyze(parsedEL);

    const d = lawDiff(origEL.json(false), (parsedEL.json(false)), true);
    const table: string[][] = [];

    for (const ditem of d.items) {
        if (ditem.type === LawDiffType.ElementMismatch) {
            table.push(...makeElementMismatchTable(ditem, d, origDOM));

        } else if (ditem.type === LawDiffType.ElementChange) {
            table.push(...makeElementChangeTable(ditem, d, origDOM));

        } else if (ditem.type === LawDiffType.NoDiff) {
            table.push(...makeElementNoDiffTable(ditem, d, origDOM));

        } else { util.assertNever(ditem); }
    }

    if (d.mostSeriousStatus !== ProblemStatus.NoProblem) {
        const msg = [
            `View XML: "${tempOrigXml}"`,
            toTableText(table, LIMIT_WIDTH),
            `View XML: "${tempOrigXml}"`,
            "",
        ].join("\r\n");

        chai.assert(false, `\x1b\r\n\r\n[39m${msg}`);
    }

});
