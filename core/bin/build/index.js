const { buildLawList: _buildLawList } = require("./lawList.js");
const { defaultBasePath: _defaultBasePath } = require("./defaultBasePath.js");

const buildLawList = _buildLawList;
const defaultBasePath = _defaultBasePath;

/**
 * @param {string} basePath
 */
const build = async (basePath = defaultBasePath) => {

    // console.log("Compiling lawnum_table...");
    await buildLawList(basePath);
};

module.exports = {
    buildLawList,
    defaultBasePath,
    build,
};

if (typeof require !== "undefined" && require.main === module) {
    build().catch(console.error);
}

