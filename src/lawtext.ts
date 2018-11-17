"use strict";

import * as argparse from "argparse";
import * as fs from "fs";
import * as analyzer from "./analyzer";
import { parse } from "./parser_wrapper";
import * as renderer from "./renderer";
import renderLawtext from "./renderers/lawtext";
import * as util from "./util";


interface Args {
    infile?: string,
    intype?: string,
    outfile?: string,
    outtype?: string,
    analysis_file?: string,
    with_control_el?: boolean,
    noanalyze?: boolean,
}

const main = (args: Args) => {
    const infile = args.infile || null;
    let intype = args.intype || null;
    const outfile = args.outfile || null;
    let outtype = args.outtype || null;
    // let analysis_file = args.analysis_file || null;
    const withControlEl = args.with_control_el || false;
    const noanalyze = args.noanalyze || false;

    // console.error("[lawtext.main]", args);

    if (!intype && infile) {
        if (infile.match(/\.xml$/)) {
            intype = "xml";
        } else if (infile.match(/\.law\.txt$/)) {
            intype = "lawtext";
        } else if (infile.match(/\.json$/)) {
            intype = "json";
        } else {
            intype = "lawtext";
        }
    }

    if (!outtype && outfile) {
        if (outfile.match(/\.xml$/)) {
            outtype = "xml";
        } else if (outfile.match(/\.json$/)) {
            outtype = "json";
        } else if (outfile.match(/\.html$/)) {
            outtype = "html";
        } else if (outfile.match(/\.law\.txt$/)) {
            outtype = "lawtext";
        } else if (outfile.match(/\.docx$/)) {
            outtype = "docx";
        } else if (intype === "xml") {
            outtype = "lawtext";
        } else if (intype === "lawtext") {
            outtype = "xml";
        } else {
            outtype = "xml";
        }
    }

    let law: util.EL | null = null;
    // let analysis: {} | null = null;

    new Promise((resolve, reject) => {

        if (infile) {
            const intext = fs.readFileSync(infile, "utf-8");
            resolve(intext);
        } else {
            let intext = '';
            process.stdin.resume();
            process.stdin.setEncoding('utf-8');
            process.stdin.on('data', chunk => {
                intext += chunk;
            });
            process.stdin.on('end', () => {
                resolve(intext);
            });
        }

    }).then((intext: string) => {

        if (intype === "xml") {
            law = util.xmlToJson(intext);
            if (!noanalyze) {
                analyzer.stdxmlToExt(law);
            }
        } else if (intype === "json") {
            const rawLaw = JSON.parse(intext);
            try {
                law = util.loadEl(rawLaw) as util.EL;
            } catch (e) {
                console.error("[loading json at main]", e);
                throw e;
            }
        } else if (intype === "lawtext") {
            try {
                law = parse(intext);
            } catch (e) {
                console.error("[parsing lawtext at main]", e);
                throw e;
            }
            if (noanalyze) {
                law = util.loadEl(law.json()) as util.EL;
            }
        }

        if (law === null) return;

        // if (!noanalyze) {
        //     analysis = analyzer.analyze(law);
        // }

        if (outtype === "docx") {
            renderer.renderDocxAsync(law.json())
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
                outtext = renderer.renderXml(law, { withControlEl });
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
}
exports.main = main;

if (typeof require !== "undefined" && require.main === module) {
    process.on('unhandledRejection', (listener) => {
        throw listener;
    });

    const argparser = new argparse.ArgumentParser();
    argparser.addArgument(["infile"], { nargs: "?" });
    argparser.addArgument(
        ["-it", "--intype"],
        { choices: ["lawtext", "xml", "json"] },
    );
    argparser.addArgument(
        ["-na", "--noanalyze"],
        { action: "storeTrue" },
    );
    argparser.addArgument(["-o", "-of", "--outfile"]);
    argparser.addArgument(
        ["-ot", "--outtype"],
        {
            choices: ["lawtext", "xml", "json", "html", "htmlfragment", "docx"],
        },
    );
    argparser.addArgument(
        ["-af", "--analysis-file"],
    );
    argparser.addArgument(
        ["-wc", "--with-control-el"],
        { action: "storeTrue" },
    );

    const args = argparser.parseArgs();

    if (!args.intype && !args.infile) {
        argparser.error("INTYPE must be specified when with stdin");
    }

    main(args);
}

