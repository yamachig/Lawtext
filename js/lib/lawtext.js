"use strict";

var parser = require("../dest/parser");
var analyzer = require("./analyzer");
var renderer = require("./renderer");
var util = require("./util");
var fs = require("fs");
var argparse = require("argparse");



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

function analyze(law) {

    // console.error("\\\\\\\\\\ analyze start \\\\\\\\\\");
    // let t0 = (new Date()).getTime();
    let analysis = analyzer.analyze(law);
    // let t1 = (new Date()).getTime();
    // console.error(`/////  analyze end  /////`);
    // console.error(`(${t1 - t0} ms total)`);
    return analysis;
}






function main(args) {
    let infile = args.infile || null;
    let intype = args.intype || null;
    let outfile = args.outfile || null;
    let outtype = args.outtype || null;
    let analysis_file = args.analysis_file || null;
    let noanalyze = args.noanalyze || false;
    let input = args.input || null;
    let as_obj = args.as_obj || false;

    if(!intype) {
        if(infile.match(/\.xml$/)) {
            intype = "xml";
        } else if(infile.match(/\.law\.txt$/)) {
            intype = "lawtext";
        } else {
            intype = "lawtext";
        }
    }

    if(!outtype && outfile) {
        if(outfile.match(/\.xml$/)) {
            outtype = "xml";
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

    if(intype === "xml") {
        let xml = fs.readFileSync(infile, "utf-8");
        law = util.xml_to_json(xml);
        analyzer.stdxml_to_ext(law);
    } else if(intype === "lawtext") {
        let text = fs.readFileSync(infile, "utf-8");
        law = parse(text);
    }

    if(!noanalyze) {
        analysis = analyzer.analyze(law);
    }

    if(outtype === "docx") {
        renderer.render_docx_async(law)
        .then(u8 => {
            if(outfile) {
                fs.writeFileSync(outfile, u8);
            }
        });
    } else {
        let outtext = null;
        if(outtype === "lawtext") {
            outtext = renderer.render_lawtext(law);
        } else if(outtype === "xml") {
            outtext = renderer.render_xml(law)
        } else if(outtype === "html") {
            outtext = renderer.render_html(law)
        } else if(outtype === "htmlfragment") {
            outtext = renderer.render_htmlfragment(law)
        }

        if(outfile) {
            fs.writeFileSync(outfile, outtext, "utf-8");
        } else {
            console.log(outtext);
        }
    }
}

if (typeof require !== "undefined" && require.main === module) {
    let argparser = new argparse.ArgumentParser();
    argparser.addArgument("infile");
    argparser.addArgument(
        ["-it", "--intype"],
        { choices: ["lawtext", "xml"] },
    );
    argparser.addArgument(
        ["-na", "--noanalyze"],
        { action: "storeTrue"},
    );
    argparser.addArgument("outfile", { nargs: "?"} );
    argparser.addArgument(
        ["-ot", "--outtype"],
        {
            choices: ["lawtext", "xml", "html", "htmlfragment", "docx"],
        },
    );
    argparser.addArgument(
        ["-af", "--analysis-file"],
    );

    let args = argparser.parseArgs();
    main(args);
}






if (typeof window !== "undefined") {
    window.Lawtext = window.Lawtext || {};
    window.Lawtext.parse = parse;
    window.Lawtext.get_law_name_length = analyze.get_law_name_length;
    window.Lawtext.analyze = analyze;
    window.Lawtext.EL = util.EL;
}

if (typeof require !== "undefined" && typeof exports !== "undefined") {
    exports.parse = parse;
    exports.get_law_name_length = analyze.get_law_name_length;
    exports.analyze = analyze;
    exports.EL = util.EL;
}

