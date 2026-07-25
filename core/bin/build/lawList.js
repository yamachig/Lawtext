const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { fetch } = require("../../src/util/node-fetch/index.js");
const { defaultBasePath } = require("./defaultBasePath.js");

/**
 * @param {string} basePath
 */
const buildLawList = async (basePath = defaultBasePath) => {
    const srcPath = path.join(basePath, "src");
    const destPath = path.join(srcPath, "law/lawList.json");
    // if (fs.existsSync(destPath)) return;

    const laws = (await (await fetch("https://laws.e-gov.go.jp/api/2/laws?omit_current_revision_info=true&limit=99999")).json()).laws;
    const lawList = laws.map(law => {
        // eslint-disable-next-line no-irregular-whitespace
        const lawTitle = law.revision_info.law_title.replace(/　抄$/, "");
        const lawNum = law.law_info.law_num;
        const lawID = law.law_info.law_id;
        const aliases = (law.revision_info.abbrev ?? "").split(",").map(alias => alias.trim()).filter(alias => alias.length > 0);
        return [
            lawID,
            lawNum,
            lawTitle,
            aliases,
        ];
    });

    await promisify(fs.writeFile)(destPath, JSON.stringify(lawList));
};

module.exports = {
    buildLawList: buildLawList,
};

if (typeof require !== "undefined" && require.main === module) {
    buildLawList().catch(console.error);
}
