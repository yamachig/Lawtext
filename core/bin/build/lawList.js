import fs from "node:fs";
import path from "path";
import { promisify } from "node:util";
import { fetch } from "../../src/util/node-fetch/index.js";
import { defaultBasePath } from "./defaultBasePath.js";

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

export { buildLawList };

if (import.meta.main) {
    buildLawList().catch(console.error);
}
