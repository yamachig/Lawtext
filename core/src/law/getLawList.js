/* eslint-disable tsdoc/syntax */
/** @type {{ lawID: string; lawNum: string; lawTitle: string; abbrev: string[] }[] | null} */
let _lawList = null;

export const getLawList = async () => {
    if (!_lawList) {
        /** @type {[string, string, string, string[]][]} */
        let lawList;
        try {
            lawList = (await eval("import(\"./lawList.json\", { assert: { type: \"json\" } })")).default;
        } catch {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            lawList = require("./lawList.json");
        }
        _lawList = lawList.map(([lawID, lawNum, lawTitle, abbrev]) => ({ lawID, lawNum, lawTitle, abbrev }));
    }
    return _lawList;
};
