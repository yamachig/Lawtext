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
        const html = (await (await fetch("https://elaws.e-gov.go.jp/abb/")).text()).replace(/[\r\n]/g, "");
        const mTable = /<table id="abbreviationTable".+?<\/table>/.exec(html);
        const table = (mTable && mTable[0]) ?? "";
        const mTbody = /<tbody.+?<\/tbody>/.exec(table);
        const tbody = (mTbody && mTbody[0]) ?? "";
        for (const mTr of tbody.matchAll(/<tr.+?<\/tr>/g)) {
            const tr = mTr[0];
            const mLawNum = /<td class="lawNoCol">(.+?)<\/td>/.exec(tr);
            const lawNum = ((mLawNum && mLawNum[1]) ?? "").trim();
            aliases[lawNum] = aliases[lawNum] ?? [];
            for (const mTd of tr.matchAll(/<td class="abbrLawNameCol">(.+?)<\/td>/g)) {
                const alias = mTd[1].trim();
                if (alias) {
                    aliases[lawNum].push(alias);
                }
            }
        }
    }
    
    const response = await fetch("https://elaws.e-gov.go.jp/api/1/lawlists/1");
    const xml = await response.text();
    const parser = new DOMParser();

    const tree = parser.parseFromString(xml);
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
