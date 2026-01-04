/**
 * @param {[url: RequestInfo, init?: RequestInit | undefined]} args
 */
// eslint-disable-next-line no-redeclare
const fetch = (...args) =>
    eval("import(\"node-fetch\")")
        .then(
            ({ default: fetch }) =>
                fetch(...args),
        );
exports.fetch = fetch;
