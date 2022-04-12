const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const nunjucks = require("nunjucks");
const { defaultBasePath } = require("./defaultBasePath.js");

/**
 * @param {string} basePath
 */
const buildTemplates = async (basePath = defaultBasePath) => {
    const srcPath = path.join(basePath, "src");
    const destPath = path.join(srcPath, "renderer/templates.js");
    // if (fs.existsSync(destPath)) return;
    // const distPath = path.join(basePath, "dist/src");

    let templates = nunjucks.precompile(
        path.join(srcPath, "renderer/templates"),
        {
            include: [".+"],
        },
    );
    templates = `if(!("window" in global)) global.window = {};
${templates}
if(exports) exports.nunjucksPrecompiled = window.nunjucksPrecompiled;
`;
    await promisify(fs.writeFile)(
        destPath,
        templates,
        { encoding: "utf-8" },
    );
    // await promisify(fs.mkdir)(distPath, { recursive: true });
    // await promisify(fs.writeFile)(
    //     path.join(distPath, "templates.js"),
    //     templates,
    //     { encoding: "utf-8" },
    // );
};
module.exports = { buildTemplates };

if (typeof require !== "undefined" && require.main === module) {
    buildTemplates().catch(console.error);
}

