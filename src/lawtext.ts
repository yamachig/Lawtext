"use strict";

import * as argparse from "argparse";
import * as fs from "fs";
import * as analyzer from "./analyzer";
import { parse } from "./parser/lawtext";
import * as renderer from "./renderer";
import renderLawtext from "./renderer/lawtext";
import { EL, JsonEL, xmlToJson, loadEl } from "./node/el";


interface Args {
    infile?: string,
    intype?: string,
    outfile?: string,
    outtype?: string,
    analysis_file?: string,
    with_control_el?: boolean,
    noanalyze?: boolean,
}

export const main = (args: Args): void => {
    const infile = args.infile || null;
    let intype = args.intype || null;
    const outfile = args.outfile || null;
    let outtype = args.outtype || null;
    // let analysis_file = args.analysis_file || null;
    const withControlEl = args.with_control_el || false;
    const noanalyze = args.noanalyze || false;

    // console.error("[lawtext.main]", args);

    if (!intype && infile) {
        if (/\.xml$/.exec(infile)) {
            intype = "xml";
        } else if (/\.law\.txt$/.exec(infile)) {
            intype = "lawtext";
        } else if (/\.json$/.exec(infile)) {
            intype = "json";
        } else {
            intype = "lawtext";
        }
    }

    if (!outtype && outfile) {
        if (/\.xml$/.exec(outfile)) {
            outtype = "xml";
        } else if (/\.json$/.exec(outfile)) {
            outtype = "json";
        } else if (/\.html$/.exec(outfile)) {
            outtype = "html";
        } else if (/\.law\.txt$/.exec(outfile)) {
            outtype = "lawtext";
        } else if (/\.docx$/.exec(outfile)) {
            outtype = "docx";
        } else if (intype === "xml") {
            outtype = "lawtext";
        } else if (intype === "lawtext") {
            outtype = "xml";
        } else {
            outtype = "xml";
        }
    }

    let law: EL | null = null;
    // let analysis: {} | null = null;

    void new Promise<string>((resolve /**/) => {

        if (infile) {
            const intext = fs.readFileSync(infile, "utf-8");
            resolve(intext);
        } else {
            let intext = "";
            process.stdin.resume();
            process.stdin.setEncoding("utf-8");
            process.stdin.on("data", chunk => {
                intext += chunk;
            });
            process.stdin.on("end", () => {
                resolve(intext);
            });
        }

    }).then((intext: string) => {

        if (intype === "xml") {
            law = xmlToJson(intext);
            if (!noanalyze) {
                analyzer.stdxmlToExt(law);
            }
        } else if (intype === "json") {
            const rawLaw = JSON.parse(intext) as JsonEL;
            try {
                law = loadEl(rawLaw) as EL;
            } catch (e) {
                console.error("[loading json at main]", e);
                throw e;
            }
        } else if (intype === "lawtext") {
            try {
                const result = parse(intext);
                law = result.value;
                for (const error of result.errors) {
                    console.error(error);
                }
            } catch (e) {
                console.error("[parsing lawtext at main]", e);
                throw e;
            }
            if (noanalyze) {
                law = loadEl(law.json()) as EL;
            }
        }

        if (law === null) return;

        // if (!noanalyze) {
        //     analysis = analyzer.analyze(law);
        // }

        if (outtype === "docx") {
            void renderer.renderDocxAsync(law.json())
                .then(u8 => {
                    if (outfile) {
                        fs.writeFileSync(outfile, u8);
                    } else {
                        process.stdout.write(u8 as Buffer);
                    }
                });
        } else {
            let outtext = "";
            if (outtype === "lawtext") {
                outtext = renderLawtext(law);
            } else if (outtype === "xml") {
                outtext = renderer.renderXml(law, withControlEl);
            } else if (outtype === "json") {
                outtext = JSON.stringify(law.json(withControlEl));
            } else if (outtype === "html") {
                outtext = renderer.renderHtml(law);
            } else if (outtype === "htmlfragment") {
                outtext = renderer.renderHtmlfragment(law);
            }

            if (outfile) {
                fs.writeFileSync(outfile, outtext, "utf-8");
            } else {
                console.log(outtext);
            }
        }

    });
};

if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", (listener) => {
        throw listener;
    });

    const argparser = new argparse.ArgumentParser();
    argparser.add_argument("infile", { nargs: "?" });
    argparser.add_argument(
        "-it", "--intype",
        { choices: ["lawtext", "xml", "json"] },
    );
    argparser.add_argument(
        "-na", "--noanalyze",
        { action: "storeTrue" },
    );
    argparser.add_argument("-of", "--outfile");
    argparser.add_argument(
        "-ot", "--outtype",
        {
            choices: ["lawtext", "xml", "json", "html", "htmlfragment", "docx"],
        },
    );
    argparser.add_argument(
        "-af", "--analysis-file",
    );
    argparser.add_argument(
        "-wc", "--with-control-el",
        { action: "storeTrue" },
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const args = argparser.parse_args();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!args.intype && !args.infile) {
        argparser.error("INTYPE must be specified when with stdin");
    }

    main(args);
}

