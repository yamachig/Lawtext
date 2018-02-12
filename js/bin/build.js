var peg = require("pegjs");
var tspegjs = require("ts-pegjs");
var nunjucks = require("nunjucks");
var fs = require("fs");
var path = require("path");

function main() {
    let base_path = path.join(__dirname, "..");
    let src_path = path.join(base_path, "src");
    // let dest_path = path.join(base_path, "dest");

    // if(!fs.existsSync(dest_path)) fs.mkdirSync(dest_path);

    fs.readFile(
        path.join(src_path, "parser.pegjs"),
        { encoding: "utf-8" },
        (err, input) => {
            if (err) throw err;
            let parser = peg.generate(input, {
                allowedStartRules: ["start", "INLINE", "ranges"],
                output: "source",
                format: "commonjs",
                plugins: [tspegjs],
                "tspegjs": {
                    "noTslint": false,
                    "customHeader": `import * as util from "./util";`
                },
            });
            fs.writeFileSync(
                path.join(src_path, "parser.ts"),
                parser,
                { encoding: "utf-8" },
            );
        },
    );

    let templates = nunjucks.precompile(
        path.join(src_path, "templates"),
        {
            include: [".+"],
        },
    );
    templates = `if(!("window" in global)) global.window = {};
${templates}
export const nunjucksPrecompiled = window.nunjucksPrecompiled;
`;
    fs.writeFileSync(
        path.join(src_path, "templates.js"),
        templates,
        { encoding: "utf-8" },
    );
}
exports.main = main;



if (typeof require !== "undefined" && require.main === module) {
    main();
}

