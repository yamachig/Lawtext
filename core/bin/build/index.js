const { buildLawNumTable: _buildLawNumTable } = require("./lawNumTable.js");
const { defaultBasePath: _defaultBasePath } = require("./defaultBasePath.js");

const buildLawNumTable = _buildLawNumTable;
const defaultBasePath = _defaultBasePath;

/**
 * @param {string} basePath
 */
const build = async (basePath = defaultBasePath) => {

    // console.log("Compiling lawnum_table...");
    await buildLawNumTable(basePath);
};

module.exports = {
    buildLawNumTable,
    defaultBasePath,
    build,
};

if (typeof require !== "undefined" && require.main === module) {
    build().catch(console.error);
}

