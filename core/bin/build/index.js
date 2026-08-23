import { buildLawList as _buildLawList } from "./lawList.js";
import { defaultBasePath as _defaultBasePath } from "./defaultBasePath.js";

const buildLawList = _buildLawList;
const defaultBasePath = _defaultBasePath;

/**
 * @param {string} basePath
 */
const build = async (basePath = defaultBasePath) => {

    // console.log("Compiling lawnum_table...");
    await buildLawList(basePath);
};

export { buildLawList, defaultBasePath, build };

if (import.meta.main) {
    build().catch(console.error);
}

