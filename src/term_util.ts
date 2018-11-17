export enum TERMC {
    DEFAULT = "\x1b[39m",
    RED = "\x1b[31m",
    GREEN = "\x1b[32m",
    YELLOW = "\x1b[33m",
    BLUE = "\x1b[34m",
    MAGENTA = "\x1b[35m",
    CYAN = "\x1b[36m",
}

const sliceWOColor = (s: string, start, length) => {
    const maxLen = s.length - start;
    let ret = "";
    for (let len = 1; len <= maxLen; len++) {
        const m = s.slice(start + len - 1).match(/^\x1b\[\d+?m/);
        if (m) len += m[0].length - 1;
        const subs = s.slice(start, start + len);
        if (widthWOColor(subs) <= length) {
            ret = subs;
        } else {
            break;
        }
    }
    return ret;
}

function* wrapSingle(s: string, width: number): IterableIterator<string> {
    let pos = 0;
    let lastFlag = "";
    while (pos < s.length) {
        const sliced = sliceWOColor(s, pos, width);
        pos += sliced.length;

        const flags = sliced.match(/\x1b\[\d+?m/g) || [];
        let retSubs = `${lastFlag}${sliced}`;
        if (flags.length) {
            const flag = flags[flags.length - 1];
            if (flag === TERMC.DEFAULT) {
                lastFlag = "";
            } else {
                lastFlag = flag;
                retSubs = `${retSubs}${TERMC.DEFAULT}`;
            }
        } else {
            retSubs = `${retSubs}${TERMC.DEFAULT}`;
        }
        yield retSubs;
    }
}

function* wrap(row: string[], width: number): IterableIterator<string[]> {
    const iters = row.map(s => wrapSingle(s, width));
    while (true) {
        const nexts = iters.map(iter => iter.next());
        if (nexts.every(({ done }) => done)) break;
        yield nexts.map(({ value }) => value || "");
    }
}

export const widthWOColor = (text: string) => {
    return text.replace(/\x1b\[\d+?m/g, "").replace(/[^\x01-\x7E\uFF61-\uFF9F]/g, "  ").length;
}

export const toTableText = (table: string[][], width: number) => {
    if (!table) return "";
    const wrapTable: string[][] = [];
    for (const row of table) {
        wrapTable.push(...wrap(row, width));
    }
    const lengths = wrapTable[0].map(() => 0);
    for (const row of wrapTable) {
        row.forEach((text, i) => {
            lengths[i] = Math.max(lengths[i], widthWOColor(text));
        });
    }

    const ret = [
        "┌" + lengths.map(l => "─".repeat(l + 2)).join("┬") + "┐",
        ...wrapTable.map(row =>
            "│"
            + row.map((text, i) =>
                " "
                + text
                + " ".repeat(lengths[i] - widthWOColor(text))
                + " "
            ).join("│")
            + "│"
        ),
        "└" + lengths.map(l => "─".repeat(l + 2)).join("┴") + "┘",
    ].join("\r\n");

    return ret;
}

export const withEllipsis = (text: string, maxLength: number) => {
    if (maxLength < widthWOColor(text)) {
        return `${sliceWOColor(text, 0, maxLength - 4)} ...`;
    } else {
        return text;
    }
}
