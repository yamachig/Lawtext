import * as lawtext from ".";
if ("window" in global) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window["lawtext"] = lawtext;
} else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global["lawtext"] = lawtext;
}
