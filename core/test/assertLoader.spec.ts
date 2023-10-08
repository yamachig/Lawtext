import { __loader } from "./prepareTest";

if (!__loader) {
    describe("Assert loader", () => {
        it("Assert loader", async function () {
            throw new Error(`
Some tests were skipped and marked "pending" because the environment variable DATA_PATH was not set.
You can specify the variable in the ".env" file at the top of the "core" directory.
Please be aware that at the first test after setting DATA_PATH, law XML data will be downloaded and decompressed into the directory (the final size will be several GBs).
`);
        });
    });
}
