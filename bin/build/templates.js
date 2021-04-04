const fs = require("fs");
const path = require("path");
const { promisify } = require ("util");
const nunjucks = require("nunjucks");
const { defaultBasePath } = require("./defaultBasePath");

/**
 * @param {string} basePath
 */
const buildTemplates = async (basePath = defaultBasePath) => {
    const srcPath = path.join(basePath, "src");
    const distPath = path.join(basePath, "dist");

    let templates = nunjucks.precompile(
        path.join(srcPath, "templates"),
        {
            include: [".+"],
        },
    );
    templates = `if(!("window" in global)) global.window = {};
${templates}
if(exports) exports.nunjucksPrecompiled = window.nunjucksPrecompiled;
`;
    await promisify(fs.writeFile)(
        path.join(srcPath, "templates.js"),
        templates,
        { encoding: "utf-8" },
    );
    await promisify(fs.mkdir)(distPath, { recursive: true });
    await promisify(fs.writeFile)(
        path.join(distPath, "templates.js"),
        templates,
        { encoding: "utf-8" },
    );
};
exports.buildTemplates = buildTemplates;

if (typeof require !== "undefined" && require.main === module) {
    buildTemplates().catch(console.error);
}

