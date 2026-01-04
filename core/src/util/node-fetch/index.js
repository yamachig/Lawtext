/* eslint-disable tsdoc/syntax */
/**
 * @param {[url: RequestInfo, init?: RequestInit | undefined]} args
 */
// eslint-disable-next-line no-redeclare
const fetch = async (...args) => {
    try {
        const { default: fetch } = await eval("import(\"node-fetch\")");
        return fetch(...args);

    } catch {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fetch = require("node-fetch").default;
        return fetch(...args);
    }
};
exports.fetch = fetch;
