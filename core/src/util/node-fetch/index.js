/**
 * @param {[url: RequestInfo, init?: RequestInit | undefined]} args
 */
const fetch = async (...args) => {
    try {
        const { default: fetch } = await eval("import(\"node-fetch\")");
        return fetch(...args);

    } catch {
        const fetch = require("node-fetch").default;
        return fetch(...args);
    }
};
exports.fetch = fetch;
