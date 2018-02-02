var peg = require("pegjs");
var nunjucks = require("nunjucks");
var fs = require("fs");
var path = require("path");

function main() {
    let base_path = path.join(__dirname, "..");
    let src_path = path.join(base_path, "src");
    let dest_path = path.join(base_path, "dest");

    if(!fs.existsSync(dest_path)) fs.mkdirSync(dest_path);

    fs.readFile(
        path.join(src_path, "parser.pegjs"),
        { encoding: "utf-8" },
        (err, input) => {
            if (err) throw err;
            let parser = peg.generate(input, {
                allowedStartRules: ["start", "INLINE"],
                output: "source",
                format: "commonjs",
            });
            fs.writeFileSync(
                path.join(dest_path, "parser.js"),
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
    templates = `global.window = global.window || {};\n${templates}`;
    fs.writeFileSync(
        path.join(dest_path, "templates.js"),
        templates,
        { encoding: "utf-8" },
    );
}



if (typeof require !== "undefined" && require.main === module) {
    main();
}

