import lawtextGlobals from ".";
for (const key in lawtextGlobals) {
    if ("window" in global) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window[key] = lawtextGlobals[key];
    } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global[key] = lawtextGlobals[key];
    }
}
