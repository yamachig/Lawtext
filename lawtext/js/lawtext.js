"use strict";

var parser = require("./parser");
var fs = require('fs');




function lex(text) {

    let lines = text.split(/\r?\n/);
    let lines_count = lines.length;
    let replaced_lines = [];
    let indent_depth = 0;
    let indent_memo = {};
    let re_indent = /^(?:  |　|\t)(?!- |-$|[ 　\t]*(?:第\S+[編章節款目章則]|[附付]\s+則|別表))/;
    let re_force_dedent_parentheses = /^(?:  |　|\t)[(（][^)）]*[)）][ 　\t]*$/
    let re_indent_in_toc = /^(?:  |　|\t)/;
    let in_toc = false;

    for(let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if(line.match(/^\S*目次$/)) {
            in_toc = true;
            replaced_lines.push(line);
            continue;
        }
        if(line.match(/^\s*$/)) {
            in_toc = false;
            replaced_lines.push(line);
            continue;
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





function parse(text) {

    console.error("\\\\\\\\\\ parse start \\\\\\\\\\");
    let t0 = (new Date()).getTime();

    let [lexed, indent_memo, lines_count] = lex(text);
    try {
        var parsed = parser.parse(lexed, { indent_memo: indent_memo });

        let t1 = (new Date()).getTime();
        console.error(`/////  parse end  /////`);
        console.error(`( ${Math.round((t1 - t0) / lines_count * 1000)} μs/line  =  ${t1 - t0} ms / ${lines_count} lines )`);
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

function main(argv) {

    if(argv.length >= 3) {
        fs.readFile(argv[2], 'utf-8', function (err, data) {
            if (err) {
                throw err;
            }
            var parsed = parse(data);
            console.log(JSON.stringify(parsed));
        });

    } else {
        var input = '';
        process.stdin.resume();
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', function(chunk) {
            input += chunk;
        });
        process.stdin.on('end', function() {
            var parsed = parse(input);
            console.log(JSON.stringify(parsed));
        });
    }
}

if (typeof require !== 'undefined' && require.main === module) {
    main(process.argv)
}

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
    exports.parse = parse;
}

if (typeof window !== 'undefined') {
    window.Lawtext = window.Lawtext || {};
    window.Lawtext.parse = parse;
}
