import { buildTemplates as _buildTemplates } from "./templates.js";
import { buildLawNumTable as _buildLawNumTable } from "./lawNumTable.js";
import { defaultBasePath as _defaultBasePath } from "./defaultBasePath.js";

export const buildTemplates = _buildTemplates;
export const buildLawNumTable = _buildLawNumTable;
export const defaultBasePath = _defaultBasePath;

/**
 * @param {string} basePath
 */
export const build = async (basePath = defaultBasePath) => {
    console.log("Compiling templates...");
    await buildTemplates(basePath);

    console.log("Compiling lawnum_table...");
    await buildLawNumTable(basePath);
};

if (typeof require !== "undefined" && require.main === module) {
    build().catch(console.error);
}

