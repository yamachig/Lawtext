var peg = require("pegjs");
var nunjucks = require("nunjucks");
var fs = require("fs-extra");
var path = require("path");
var build = require("./build").main;
var browserify = require('browserify');
var exorcist = require('exorcist');
var babel = require("babel-core");
var argparse = require("argparse");

function main(args) {
    build();

    let base_path = path.join(__dirname, "..");
    let src_path = path.join(base_path, "htmlapp_templates");
    let dest_path = args.infile;

    if(fs.existsSync(dest_path)) fs.removeSync(dest_path);
    fs.mkdirSync(dest_path);

    fs.copySync(src_path, dest_path);

    fs.copyFileSync(
        path.join(base_path, "lib/static/law.css"),
        path.join(dest_path, "src/law.css"),
    );

    let b = browserify(path.join(src_path, "src/lawtext-app.js"), {debug: true});
    b.ignore("lodash");

    let dest_stream = fs.createWriteStream(path.join(dest_path, "src/lawtext.js"), 'utf-8');

    b.bundle()
    .pipe(exorcist(path.join(dest_path, "src/lawtext.map.js",)))
    .pipe(dest_stream);

    dest_stream.on("close", () => {
        let ie_code = babel.transformFileSync(
            path.join(dest_path, "src/lawtext.js"),
            {
                babelrc: false,
                compact: false,
                presets: ["es2015"],
            },
        );
        fs.writeFileSync(
            path.join(dest_path, "src/ie_lawtext.js"),
            ie_code.code,
            { encoding: "utf-8" },
        );
    });
}

if (typeof require !== "undefined" && require.main === module) {
    let argparser = new argparse.ArgumentParser();
    argparser.addArgument("infile");
    let args = argparser.parseArgs();
    main(args);
}
