#!/usr/bin/env node

import yargs from "yargs";
import * as lawtext from "./lawtext";
import * as fs from "fs";
import { assertNever } from "./util";
import { figPDFTypes } from "./renderer/common/docx/FigDataManager";

export { run } from "./lawtext";

export interface RunCLIArgs {
    input: string | null;
    output: string | null;
    analysisout: string | null;
    virtuallinesout: string | null;
    intype: (typeof lawtext.intypeChoices)[number];
    outtype: (typeof lawtext.outtypeChoices)[number];
    figpdf: Lowercase<(typeof figPDFTypes)[number]>;
    analyze: boolean;
    format: boolean;
    controlel: boolean;
}

export const defaultRunCLIArgs = {
    input: null,
    output: null,
    analysisout: null,
    virtuallinesout: null,
    intype: "fromext" as const,
    outtype: "fromext" as const,
    figpdf: "embed" as const,
    analyze: false,
    format: false,
    controlel: false,
};

export const runCLI = async (args: RunCLIArgs) => {
    const {
        input,
        output,
        analysisout,
        virtuallinesout,
        intype: origIntype,
        outtype: origOuttype,
        figpdf: origFigpdf,
        analyze,
        format,
        controlel,
    } = {
        ...defaultRunCLIArgs,
        ...args,
    };

    let intype: Exclude<RunCLIArgs["intype"], "fromext">;
    let outtype: Exclude<RunCLIArgs["outtype"], "fromext">;
    let figpdf: (typeof figPDFTypes)[number] | null = null;

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

    for (const t of figPDFTypes) {
        if (t.toLowerCase() === origFigpdf.toLowerCase()) {
            figpdf = t;
            break;
        }
    }
    if (!figpdf) throw new Error("Cannot recognize the type specified for \"--figpdf\".");

    if (analysisout && !analyze) {
        console.error("Warning: \"--analysisout\" has no effect without \"--analyze\".");
    }

    if (virtuallinesout && intype !== "lawtext") {
        console.error("Warning: \"--virtuallinesout\" has no effect without lawtext input.");
    }

    let runInput: lawtext.RunArgs["input"];
    if (input) {
        const m = /^elaws:(.+)$/.exec(input);
        if (m) {
            runInput = { elaws: m[1] };
        } else {
            runInput = { [intype]: fs.readFileSync(input, "utf-8") } as {[K in typeof intype]: string};
        }
    } else {
        let t = "";
        process.stdin.resume();
        process.stdin.setEncoding("utf-8");
        for await (const chunk of process.stdin) t += chunk;
        runInput = { [intype]: t } as {[K in typeof intype]: string};
    }

    const result = await lawtext.run({
        input: runInput,
        outtypes: [outtype],
        figpdf,
        analyze,
        format,
        controlel,
    });


    if (analysisout && result.analysis) {
        const analysistext = JSON.stringify(
            {
                pointerRangesList: result.analysis.pointerRangesList.map(r => r.json(true, true)),
                declarations: result.analysis.declarations.values().map(d => d.json(true, true)),
                variableReferences: result.analysis.variableReferences.map(v => v.json(true, true)),
                errors: result.analysis.errors,
            },
            undefined,
            format ? 2 : undefined,
        );
        fs.writeFileSync(analysisout, analysistext);
    }

    if (outtype === "docx") {
        if (!result.docx) throw new Error("output does not exist");
        if (output) {
            fs.writeFileSync(output, result.docx);
        } else {
            process.stdout.write(result.docx as Buffer);
        }
    } else {
        let outtext = "";
        if (outtype === "lawtext") {
            if (!result.lawtext) throw new Error("output does not exist");
            outtext = result.lawtext;
        } else if (outtype === "xml") {
            if (!result.xml) throw new Error("output does not exist");
            outtext = result.xml; // Already formatted if `format` is true
        } else if (outtype === "json") {
            if (!result.json) throw new Error("output does not exist");
            outtext = JSON.stringify(
                result.json,
                undefined,
                format ? 2 : undefined,
            );
        } else if (outtype === "html") {
            if (!result.html) throw new Error("output does not exist");
            outtext = result.html;
        } else if (outtype === "htmlfragment") {
            if (!result.htmlfragment) throw new Error("output does not exist");
            outtext = result.htmlfragment;
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
            default: defaultRunCLIArgs.input,
            description: "A path of input file, or lawID or lawNum to be requested to e-LAWS API in the form \"elaws:{lawID or lawNum}\". If not set, read from stdin.",
        })
        .option("output", {
            alias: "o",
            type: "string",
            default: defaultRunCLIArgs.output,
            description: "A path of output file. If not set, write to stdout.",
        })
        .option("analysisout", {
            alias: "ao",
            type: "string",
            default: defaultRunCLIArgs.analysisout,
            description: "A path of optional analysis output file. It requires \"--analyze\".",
        })
        .option("virtuallinesout", {
            alias: "vo",
            type: "string",
            default: defaultRunCLIArgs.virtuallinesout,
            description: "A path of optional `VirtualLine`s output file. It requires lawtext input.",
        })
        .option("intype", {
            alias: "it",
            choices: lawtext.intypeChoices,
            default: defaultRunCLIArgs.intype,
            description: "Type of input. Set \"fromext\" to guess from the extension of \"--infile\"",
        })
        .option("outtype", {
            alias: "ot",
            choices: lawtext.outtypeChoices,
            default: defaultRunCLIArgs.outtype,
            description: "Type of output. Set \"fromext\" to guess from the extension of \"--outfile\"",
        })
        .option("figpdf", {
            alias: "fp",
            choices: figPDFTypes.map(t => t.toLowerCase()) as Lowercase<(typeof figPDFTypes)[number]>[],
            default: defaultRunCLIArgs.figpdf,
            description: "How to process embedded PDF files. (Only applicable for the combination of `elaws` input and `docx` output.)",
        })
        .option("analyze", {
            alias: "an",
            type: "boolean",
            default: defaultRunCLIArgs.analyze,
            description: "If set, conduct the analysis process.",
        })
        .option("format", {
            alias: "fo",
            type: "boolean",
            default: defaultRunCLIArgs.format,
            description: "If set, format the XML or JSON output.",
        })
        .option("controlel", {
            alias: "ce",
            type: "boolean",
            default: defaultRunCLIArgs.controlel,
            description: "If set, emit the control elements in XML or JSON output.",
        });

    try {
        await runCLI(await args.argv);
    } catch (e) {
        args.showHelp();
        throw e;
    }
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mainModule = (typeof __non_webpack_require__ !== "undefined") ? __non_webpack_require__.main : require.main;

if (mainModule?.filename === __filename) {
    process.on("unhandledRejection", e => {
        console.dir(e);
        process.exit(1);
    });
    main().catch(e => { throw e; });
}

