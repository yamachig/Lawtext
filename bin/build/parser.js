const fs = require("fs");
const path = require("path");
const peg = require ("pegjs");
const tspegjs = require("ts-pegjs");
const { promisify } = require ("util");
const { defaultBasePath } = require("./defaultBasePath");

/**
 * @param {string} basePath
 */
const buildParser = async (basePath = defaultBasePath) => {
    const srcPath = path.join(basePath, "src");

    const input = await promisify(fs.readFile)(
        path.join(srcPath, "parser.pegjs"),
        { encoding: "utf-8" },
    );

    const options = {
        allowedStartRules: ["start", "INLINE", "ranges"],
        output: "source",
        format: "commonjs",
        plugins: [tspegjs],
    };
    const parser = peg.generate(input, {
        ...options,
        "tspegjs": {
            "noTslint": false,
            "customHeader": `
// @ts-nocheck
import * as util from "./util";
import * as std from "./std_law";
`.trimLeft(),
        },
    });

    await promisify(fs.writeFile)(
        path.join(srcPath, "parser.ts"),
        parser,
        { encoding: "utf-8" },
    );
};
exports.buildParser = buildParser;

if (typeof require !== "undefined" && require.main === module) {
    buildParser().catch(console.error);
}
