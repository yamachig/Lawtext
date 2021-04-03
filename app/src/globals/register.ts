import * as globals from ".";
for (const key in globals) {
    if ("window" in global) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window[key] = globals[key];
    } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global[key] = globals[key];
    }
}
