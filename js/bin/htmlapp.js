var peg = require("pegjs");
var nunjucks = require("nunjucks");
var fs = require("fs-extra");
var path = require("path");
var webpack = require('webpack');
var argparse = require("argparse");
// var WebpackPreBuildPlugin = require('pre-build-webpack');
var build = require('../bin/build');

function main(args) {
    build.main();

    let base_path = path.resolve(path.join(__dirname, ".."));
    let src_path = path.join(base_path, "htmlapp_templates");
    let dest_path = path.resolve(args.dest_path);

    if(fs.existsSync(dest_path)) fs.removeSync(dest_path);
    fs.mkdirSync(dest_path);
    if(args.local && fs.existsSync(args.local)) {
        fs.symlinkSync(args.local, path.join(dest_path, "lawdata"), "dir");
    }

    fs.copySync(src_path, dest_path);
    fs.removeSync(path.join(dest_path, "src/lawtext-app.ts"));
    fs.removeSync(path.join(dest_path, "src/lawdata.ts"));
    fs.removeSync(path.join(dest_path, "templates"));

    fs.copyFileSync(
        path.join(base_path, "src/static/law.css"),
        path.join(dest_path, "src/law.css"),
    );

    let webpack_opt = {
        entry: path.join(src_path, "src/lawtext-app.ts"),
        output: {
            path: path.join(dest_path, "src"),
            filename: "lawtext.min.js",
            libraryTarget: "window",
        },
        target: "web",
        node: {
            fs: "empty",
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        externals: {
            jquery: "$",
            backbone: "Backbone",
            underscore: "_",
            file_saver: "FileSaver",
            bootstrap: "window",

            lodash: "_",
            nunjucks: "nunjucks",
            jszip: "JSZip",
            xmldom: "window",
            argparse: "window",
        },
        module: {
            rules: [{
                    test: /\.ts$/,
                    use: {
                        loader: 'ts-loader',
                    },
                },
                {
                    enforce: "pre",
                    test: /\.js$/,
                    loader: "source-map-loader",
                },
            ],
        },
        // plugins: [
        //     new WebpackPreBuildPlugin(function (stats) {
        //         build.main();
        //     }),
        // ],
        devtool: "source-map",
    };

    if(args.dev) {
    } else {
        webpack_opt = Object.assign(webpack_opt, {
            plugins: [
                new webpack.optimize.UglifyJsPlugin({
                    sourceMap: true,
                    uglifyOptions: {ecma: 6},
                }),
            ],
        });
    }

    webpack(webpack_opt, (err, stats) => { if(err) throw err; });
}

if (typeof require !== "undefined" && require.main === module) {
    let argparser = new argparse.ArgumentParser();
    argparser.addArgument("dest_path");
    argparser.addArgument(
        ["-d", "--dev"],
        { action: "storeTrue" },
    );
    argparser.addArgument(["-l", "--local"]);
    let args = argparser.parseArgs();
    main(args);
}
