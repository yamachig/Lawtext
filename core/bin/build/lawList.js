const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { DOMParser } = require("@xmldom/xmldom");
const { fetch } = require("../../src/util/node-fetch/index.js");
const { defaultBasePath } = require("./defaultBasePath.js");

/**
 * @param {string} basePath
 */
const buildLawList = async (basePath = defaultBasePath) => {
    const srcPath = path.join(basePath, "src");
    const destPath = path.join(srcPath, "law/lawList.json");
    // if (fs.existsSync(destPath)) return;

    /** @type {Record<string, string[]>} */
    const aliases = {};
    {
        const lawList = await (await fetch("https://laws.e-gov.go.jp/api/2/laws?omit_current_revision_info=true&limit=99999")).json();
        for (const law of lawList.laws) {
            const lawNum = law.law_info.law_num;
            aliases[lawNum] = aliases[lawNum] ?? [];
            if (!law.revision_info.abbrev) continue;
            for (const alias of law.revision_info.abbrev.split(",")) {
                aliases[lawNum].push(alias.trim());
            }
        }
    }
    
    const response = await fetch("https://laws.e-gov.go.jp/api/1/lawlists/1");
    const xml = await response.text();
    const parser = new DOMParser();

    const tree = parser.parseFromString(xml, "application/xml");
    const lawList = Array.from(tree.getElementsByTagName("LawNameListInfo")).map(law => {
        const LawNameEL = law.getElementsByTagName("LawName").item(0);
        const rawLawName = (LawNameEL && LawNameEL.textContent) || "";
        // eslint-disable-next-line no-irregular-whitespace
        const lawName = rawLawName.replace(/　抄$/, "");
        const LawNoEL = law.getElementsByTagName("LawNo").item(0);
        const lawNo = (LawNoEL && LawNoEL.textContent) || "";
        const LawIdEL = law.getElementsByTagName("LawId").item(0);
        const lawID = (LawIdEL && LawIdEL.textContent) || "";
        return [
            lawID,
            lawNo,
            lawName,
            aliases[lawNo] ?? [],
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
