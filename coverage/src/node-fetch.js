/**
 * @param {[url: RequestInfo, init?: RequestInit | undefined]} args
 */
const fetch = (...args) =>
    import("node-fetch")
        .then(
            ({ default: fetch }) =>
                fetch(...args),
        );
exports.fetch = fetch;
