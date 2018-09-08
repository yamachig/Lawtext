"use strict";

import * as analyzer from "./analyzer";
import * as renderer from "./renderer";
import render_lawtext from "./renderers/lawtext";
import * as util from "./util";
import * as fs from "fs";
import * as argparse from "argparse";
import { parse } from "./parser_wrapper"


interface Args {
    infile?: string,
    intype?: string,
    outfile?: string,
    outtype?: string,
    analysis_file?: string,
    with_control_el?: boolean,
    noanalyze?: boolean,
}

function main(args: Args) {
    let infile = args.infile || null;
    let intype = args.intype || null;
    let outfile = args.outfile || null;
    let outtype = args.outtype || null;
    // let analysis_file = args.analysis_file || null;
    let with_control_el = args.with_control_el || false;
    let noanalyze = args.noanalyze || false;

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
            let intext = fs.readFileSync(infile, "utf-8");
            resolve(intext);
        } else {
            var intext = '';
            process.stdin.resume();
            process.stdin.setEncoding('utf-8');
            process.stdin.on('data', function (chunk) {
                intext += chunk;
            });
            process.stdin.on('end', function () {
                resolve(intext);
            });
        }

    }).then((intext: string) => {

        if (intype === "xml") {
            law = util.xml_to_json(intext);
            if (!noanalyze) {
                analyzer.stdxml_to_ext(law);
            }
        } else if (intype === "json") {
            let raw_law = JSON.parse(intext);
            try {
                law = <util.EL>util.load_el(raw_law);
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
                law = <util.EL>util.load_el(law.json());
            }
        }

        if (law === null) return;

        // if (!noanalyze) {
        //     analysis = analyzer.analyze(law);
        // }

        if (outtype === "docx") {
            renderer.render_docx_async(law.json())
                .then(u8 => {
                    if (outfile) {
                        fs.writeFileSync(outfile, u8);
                    } else {
                        process.stdout.write(<Buffer>u8);
                    }
                });
        } else {
            let outtext = "";
            if (outtype === "lawtext") {
                outtext = render_lawtext(law);
            } else if (outtype === "xml") {
                outtext = renderer.render_xml(law, { with_control_el: with_control_el });
            } else if (outtype === "json") {
                outtext = JSON.stringify(law.json(with_control_el));
            } else if (outtype === "html") {
                outtext = renderer.render_html(law);
            } else if (outtype === "htmlfragment") {
                outtext = renderer.render_htmlfragment(law);
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

    let argparser = new argparse.ArgumentParser();
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

    let args = argparser.parseArgs();

    if (!args.intype && !args.infile) {
        argparser.error("INTYPE must be specified when with stdin");
    }

    main(args);
}

