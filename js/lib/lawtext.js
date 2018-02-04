"use strict";

var parser = require("../dest/parser");
var analyzer = require("./analyzer");
var renderer = require("./renderer");
var util = require("./util");
var fs = require("fs");
var argparse = require("argparse");

exports.analyzer = analyzer;
exports.util = util;
exports.renderer = renderer;



function lex(text) {

    let lines = text.split(/\r?\n/);
    let lines_count = lines.length;
    let replaced_lines = [];
    let indent_depth = 0;
    let indent_memo = {};
    let re_indent = /^(?:  |　|\t)(?!- |-$|[ 　\t]*(?:第[一二三四五六七八九十百千]+[編章節款目章]|[附付]\s+則|別表))/;
    let re_force_dedent_parentheses = /^(?:  |　|\t)[(（][^)）]*[)）][ 　\t]*$/
    let re_indent_in_toc = /^(?:  |　|\t)/;
    let in_toc = false;

    for(let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if(line.match(/^\s*$/)) {
            in_toc = false;
            replaced_lines.push(line);
            continue;
        }

        if(line.match(/^\S*目次$/)) {
            in_toc = true;
        }

        let force_dedent = false;
        if(line.match(re_force_dedent_parentheses)) {
            force_dedent = true;
        }

        let indents = [];
        let pos = 0;

        if(!force_dedent) {
            while(true) {
                let match = line.slice(pos).match(in_toc ? re_indent_in_toc : re_indent);
                if(!match) break;
                let indent = match[0];
                pos += indent.length;
                indents.push(indent);
            }
        }

        let replaced_line = ""
        if(indent_depth <= indents.length) {
            for(let j = indent_depth; j < indents.length; j++) {
                let indent = indents[j];
                replaced_line += `<INDENT str="${indent}">`;
            }
        } else {
            for(let j = 0; j < (indent_depth - indents.length); j++) {
                replaced_line += `<DEDENT>`;
            }
        }
        replaced_line += line.slice(pos);

        replaced_lines.push(replaced_line);

        indent_depth = indents.length;
        indent_memo[i + 1] = indent_depth
    }
    if(0 < indent_depth) {
        let replaced_line = ""
        for(let j = 0; j < indent_depth; j++) {
            replaced_line += `<DEDENT>`;
        }
        replaced_lines.push(replaced_line);
    }

    let replaced_text = replaced_lines.join("\n");

    return [replaced_text, indent_memo, lines_count];
}





function parse(text, options) {

    // console.error("\\\\\\\\\\ parse start \\\\\\\\\\");
    // let t0 = (new Date()).getTime();

    let [lexed, indent_memo, lines_count] = lex(text);
    // console.error(lexed);
    try {
        options = Object.assign({ indent_memo: indent_memo, startRule: "start" }, options);
        var parsed = parser.parse(lexed, options);

        // let t1 = (new Date()).getTime();
        // console.error(`/////  parse end  /////`);
        // console.error(`( ${Math.round((t1 - t0) / lines_count * 1000)} μs/line  =  ${t1 - t0} ms / ${lines_count} lines )`);
    } catch(e) {
        console.error("##### parse error #####");
        if(e.location) {
            console.error(`${e.name} at line ${e.location.start.line} column ${e.location.start.column}: ${e.message}`);
            // console.error(`${JSON.stringify(e, null, 4)}`);
        }
        throw(e);
    }
    return parsed;
}
exports.parse = parse;

function analyze(law) {

    // console.error("\\\\\\\\\\ analyze start \\\\\\\\\\");
    // let t0 = (new Date()).getTime();
    let analysis = analyzer.analyze(law);
    // let t1 = (new Date()).getTime();
    // console.error(`/////  analyze end  /////`);
    // console.error(`(${t1 - t0} ms total)`);
    return analysis;
}
exports.analyze = analyze;






function main(args) {
    let infile = args.infile || null;
    let intype = args.intype || null;
    let outfile = args.outfile || null;
    let outtype = args.outtype || null;
    let analysis_file = args.analysis_file || null;
    let with_control_el = args.with_control_el || false;
    let noanalyze = args.noanalyze || false;

    // console.error("[lawtext.main]", args);

    if(!intype && infile) {
        if(infile.match(/\.xml$/)) {
            intype = "xml";
        } else if(infile.match(/\.law\.txt$/)) {
            intype = "lawtext";
        } else if(infile.match(/\.json$/)) {
            intype = "json";
        } else {
            intype = "lawtext";
        }
    }

    if(!outtype && outfile) {
        if(outfile.match(/\.xml$/)) {
            outtype = "xml";
        } else if(outfile.match(/\.json$/)) {
            outtype = "json";
        } else if(outfile.match(/\.html$/)) {
            outtype = "html";
        } else if(outfile.match(/\.law\.txt$/)) {
            outtype = "lawtext";
        } else if(outfile.match(/\.docx$/)) {
            outtype = "docx";
        } else if(intype === "xml") {
            outtype = "lawtext";
        } else if(intype === "lawtext") {
            outtype = "xml";
        } else {
            outtype = "xml";
        }
    }

    let law = null;
    let analysis = null;

    new Promise((resolve, reject) => {

        if(infile) {
            let intext = fs.readFileSync(infile, "utf-8");
            resolve(intext);
        } else{
            var intext = '';
            process.stdin.resume();
            process.stdin.setEncoding('utf-8');
            process.stdin.on('data', function(chunk) {
                intext += chunk;
            });
            process.stdin.on('end', function() {
                resolve(intext);
            });
        }

    })
    .then((intext) => {

        if(intype === "xml") {
            law = util.xml_to_json(intext);
            if(!noanalyze) {
                analyzer.stdxml_to_ext(law);
            }
        } else if(intype === "json") {
            let raw_law = JSON.parse(intext);
            try {
                law = util.load_el(raw_law);
            } catch(e) {
                console.error("[loading json at main]", e);
                throw e;
            }
        } else if(intype === "lawtext") {
            try {
                law = parse(intext);
            } catch(e) {
                console.error("[parsing lawtext at main]", e);
                throw e;
            }
            if(noanalyze) {
                law = util.load_el(law.json());
            }
        }

        if(!noanalyze) {
            analysis = analyzer.analyze(law);
        }

        if(outtype === "docx") {
            renderer.render_docx_async(law.json())
            .then(u8 => {
                if(outfile) {
                    fs.writeFileSync(outfile, u8);
                } else{
                    process.stdout.write(u8);
                }
            });
        } else {
            let outtext = null;
            if(outtype === "lawtext") {
                outtext = renderer.render_lawtext(law);
            } else if(outtype === "xml") {
                outtext = renderer.render_xml(law, {with_control_el: with_control_el});
            } else if(outtype === "json") {
                outtext = JSON.stringify(law.json(with_control_el));
            } else if(outtype === "html") {
                outtext = renderer.render_html(law);
            } else if(outtype === "htmlfragment") {
                outtext = renderer.render_htmlfragment(law);
            }

            if(outfile) {
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
    argparser.addArgument("infile", { nargs: "?"});
    argparser.addArgument(
        ["-it", "--intype"],
        { choices: ["lawtext", "xml", "json"] },
    );
    argparser.addArgument(
        ["-na", "--noanalyze"],
        { action: "storeTrue"},
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
        { action: "storeTrue"},
    );

    let args = argparser.parseArgs();

    if(!args.intype && !args.infile) {
        argparser.error("INTYPE must be specified when with stdin");
    }

    main(args);
}

