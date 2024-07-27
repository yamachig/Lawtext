/** @type {{ lawID: string; lawNum: string; lawTitle: string; abbrev: string[] }[] | null} */
let _lawList = null;

const getLawListPromise = (async () => {
    /** @type {[string, string, string, string[]][]} */
    let lawList;
    try {
        lawList = (await eval("import(\"./lawList.json\", { assert: { type: \"json\" } })")).default;
    } catch {
        lawList = await (await fetch("https://lic857vlz1.execute-api.ap-northeast-1.amazonaws.com/prod/Lawtext-API?method=lawlist")).json();
    }
    return lawList.map(([lawID, lawNum, lawTitle, abbrev]) => ({ lawID, lawNum, lawTitle, abbrev }));
})();

export const getLawList = async () => {
    if (!_lawList) {
        _lawList = await getLawListPromise;
    }
    return _lawList;
};
