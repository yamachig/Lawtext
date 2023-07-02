#!/usr/bin/env node

import * as fs from "fs";
import { parse } from "./parser/lawtext";
import * as renderer from "./renderer";
import renderLawtext from "./renderer/lawtext";
import { analyze as analyzeEL } from "./analyzer";
import loadEL from "./node/el/loadEL";
import { xmlToEL } from "./node/el/xmlToEL";
import { JsonEL } from "./node/el/jsonEL";
import addSentenceChildrenControls from "./parser/addSentenceChildrenControls";
import * as std from "./law/std";
import yargs from "yargs";
import { assertNever } from "./util";
import formatXML from "./util/formatXml";
import { fetchLawData } from "./elaws_api";

const intypeChoices = ["fromext", "lawtext", "xml", "json"] as const;
const outtypeChoices = ["fromext", "lawtext", "xml", "json", "html", "htmlfragment", "docx"] as const;

interface LawtextCLIArgs {
    input: string | null;
    output: string | null;
    analysisout: string | null;
    virtuallinesout: string | null;
    intype: (typeof intypeChoices)[number];
    outtype: (typeof outtypeChoices)[number];
    analyze: boolean;
    format: boolean;
    controlel: boolean;
}

export const lawtextCLI = async (args: LawtextCLIArgs) => {
    const {
        input,
        output,
        analysisout,
        virtuallinesout,
        intype: origIntype,
        outtype: origOuttype,
        analyze,
        format,
        controlel,
    } = args;

    let intype: Exclude<LawtextCLIArgs["intype"], "fromext">;
    let outtype: Exclude<LawtextCLIArgs["outtype"], "fromext">;

    if (origIntype === "fromext") {
        if (!input) {
            throw new Error("Please specify \"--intype\" when without \"--input\".");
        } else if (/^elaws:/.exec(input)) {
            intype = "xml";
        } else if (/\.xml$/.exec(input)) {
            intype = "xml";
        } else if (/\.(?:law)?txt$/.exec(input)) {
            intype = "lawtext";
        } else if (/\.json$/.exec(input)) {
            intype = "json";
        } else {
            throw new Error("Cannot guess \"--intype\" from \"--input\".");
        }
    } else {
        intype = origIntype;
    }

    if (origOuttype === "fromext") {
        if (!output) {
            if (intype === "xml") {
                outtype = "lawtext";
            } else if (intype === "lawtext") {
                outtype = "xml";
            } else {
                throw new Error("Please specify \"--outtype\" when without \"--output\".");
            }
        } else if (/\.xml$/.exec(output)) {
            outtype = "xml";
        } else if (/\.json$/.exec(output)) {
            outtype = "json";
        } else if (/\.html$/.exec(output)) {
            outtype = "html";
        } else if (/\.(?:law)?txt$/.exec(output)) {
            outtype = "lawtext";
        } else if (/\.docx$/.exec(output)) {
            outtype = "docx";
        } else {
            throw new Error("Cannot guess \"--outtype\" from \"--output\".");
        }
    } else {
        outtype = origOuttype;
    }

    if (analysisout && !analyze) {
        console.error("Warning: \"--analysisout\" has no effect without \"--analyze\".");
    }

    if (virtuallinesout && intype !== "lawtext") {
        console.error("Warning: \"--virtuallinesout\" has no effect without lawtext input.");
    }

    let intext: string;
    if (input) {
        const m = /^elaws:(.+)$/.exec(input);
        if (m) {
            const lawData = await fetchLawData(m[1]);
            intext = lawData.xml;
        } else {
            intext = fs.readFileSync(input, "utf-8");
        }
    } else {
        intext = "";
        process.stdin.resume();
        process.stdin.setEncoding("utf-8");
        for await (const chunk of process.stdin) intext += chunk;
    }

    let law: std.Law;
    if (intype === "xml") {
        law = xmlToEL(intext) as std.Law;
        if (analyze) {
            addSentenceChildrenControls(law);
        }
    } else if (intype === "json") {
        const rawLaw = JSON.parse(intext) as JsonEL;
        try {
            law = loadEL(rawLaw) as std.Law;
        } catch (e) {
            console.error("[loading json at main]", e);
            throw e;
        }
        if (analyze) {
            addSentenceChildrenControls(law);
        }
    } else if (intype === "lawtext") {
        try {
            const result = parse(intext);
            law = result.value;
            for (const error of result.errors) {
                console.error(error);
            }
            if (virtuallinesout) {
                const virtuallinestext = JSON.stringify(
                    result.virtualLines,
                    undefined,
                    format ? 2 : undefined,
                );
                fs.writeFileSync(virtuallinesout, virtuallinestext);
            }
        } catch (e) {
            console.error("[parsing lawtext at main]", e);
            throw e;
        }
        if (!analyze) {
            law = loadEL(law.json()) as std.Law;
        }
    } else { throw assertNever(intype); }

    if (analyze) {
        const analysis = analyzeEL(law);
        if (analysisout) {
            const analysistext = JSON.stringify(
                {
                    pointerRangesList: analysis.pointerRangesList.map(r => r.json(true, true)),
                    declarations: analysis.declarations.values().map(d => d.json(true, true)),
                    variableReferences: analysis.variableReferences.map(v => v.json(true, true)),
                    errors: analysis.errors,
                },
                undefined,
                format ? 2 : undefined,
            );
            fs.writeFileSync(analysisout, analysistext);
        }
    }

    if (outtype === "docx") {
        const u8 = await renderer.renderDocxAsync(law.json());
        if (output) {
            fs.writeFileSync(output, u8);
        } else {
            process.stdout.write(u8 as Buffer);
        }
    } else {
        let outtext = "";
        if (outtype === "lawtext") {
            outtext = renderLawtext(law);
        } else if (outtype === "xml") {
            outtext = renderer.renderXML(law, controlel);
            if (format) {
                outtext = formatXML(outtext);
            }
        } else if (outtype === "json") {
            outtext = JSON.stringify(
                law.json(controlel, controlel),
                undefined,
                format ? 2 : undefined,
            );
        } else if (outtype === "html") {
            outtext = renderer.renderHTML(law);
        } else if (outtype === "htmlfragment") {
            outtext = renderer.renderHTMLfragment(law);
        } else { throw assertNever(outtype); }

        if (output) {
            fs.writeFileSync(output, outtext, "utf-8");
        } else {
            console.log(outtext);
        }
    }
};

export const main = async (): Promise<void> => {

    const args = yargs
        .option("input", {
            alias: "i",
            type: "string",
            default: null,
            description: "A path of input file, or lawID or lawNum to be requested to e-LAWS API in the form \"elaws:{lawID or lawNum}\". If not set, read from stdin.",
        })
        .option("output", {
            alias: "o",
            type: "string",
            default: null,
            description: "A path of output file. If not set, write to stdout.",
        })
        .option("analysisout", {
            alias: "ao",
            type: "string",
            default: null,
            description: "A path of optional analysis output file. It requires \"--analyze\".",
        })
        .option("virtuallinesout", {
            alias: "vo",
            type: "string",
            default: null,
            description: "A path of optional `VirtualLine`s output file. It requires lawtext input.",
        })
        .option("intype", {
            alias: "it",
            choices: intypeChoices,
            default: "fromext" as const,
            description: "Type of input. Set \"fromext\" to guess from the extension of \"--infile\"",
        })
        .option("outtype", {
            alias: "ot",
            choices: outtypeChoices,
            default: "fromext" as const,
            description: "Type of output. Set \"fromext\" to guess from the extension of \"--outfile\"",
        })
        .option("analyze", {
            alias: "an",
            type: "boolean",
            default: false,
            description: "If set, conduct the analysis process.",
        })
        .option("format", {
            alias: "fo",
            type: "boolean",
            default: false,
            description: "If set, format the XML or JSON output.",
        })
        .option("controlel", {
            alias: "ce",
            type: "boolean",
            default: false,
            description: "If set, emit the control elements in XML or JSON output.",
        });

    try {
        await lawtextCLI(await args.argv);
    } catch (e) {
        args.showHelp();
        throw e;
    }
};

if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", e => {
        console.dir(e);
        process.exit(1);
    });
    main().catch(e => { throw e; });
}

