import { Bar, Presets } from "cli-progress";

export enum TERMC {
    // eslint-disable-next-line no-unused-vars
    DEFAULT = "\x1b[39m",
    // eslint-disable-next-line no-unused-vars
    RED = "\x1b[31m",
    // eslint-disable-next-line no-unused-vars
    GREEN = "\x1b[32m",
    // eslint-disable-next-line no-unused-vars
    YELLOW = "\x1b[33m",
    // eslint-disable-next-line no-unused-vars
    BLUE = "\x1b[34m",
    // eslint-disable-next-line no-unused-vars
    MAGENTA = "\x1b[35m",
    // eslint-disable-next-line no-unused-vars
    CYAN = "\x1b[36m",
}

const sliceWOColor = (s: string, start: number, length: number) => {
    const maxLen = s.length - start;
    let ret = "";
    for (let len = 1; len <= maxLen; len++) {
        // eslint-disable-next-line no-control-regex
        const m = /^\x1b\[\d+?m/.exec(s.slice(start + len - 1));
        if (m) len += m[0].length - 1;
        const subs = s.slice(start, start + len);
        if (widthWOColor(subs) <= length) {
            ret = subs;
        } else {
            break;
        }
    }
    return ret;
};

interface IterableIterator<T> extends Iterator<T, void, undefined> {
    [Symbol.iterator](): IterableIterator<T>;
}

function* wrapSingle(s: string, width: number): IterableIterator<string> {
    let pos = 0;
    let lastFlag = "";
    while (pos < s.length) {
        const sliced = sliceWOColor(s, pos, width);
        pos += sliced.length;

        // eslint-disable-next-line no-control-regex
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

export const widthWOColor = (text: string): number => {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[\d+?m/g, "").replace(/[^\x01-\x7E\uFF61-\uFF9F]/g, "  ").length;
};

export const toTableText = (table: string[][], width: number): string => {
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
                + " ",
            ).join("│")
            + "│",
        ),
        "└" + lengths.map(l => "─".repeat(l + 2)).join("┴") + "┘",
    ].join("\r\n");

    return ret;
};

export const withEllipsis = (text: string, maxLength: number): string => {
    if (maxLength < widthWOColor(text)) {
        return `${sliceWOColor(text, 0, maxLength - 4)} ...`;
    } else {
        return text;
    }
};
export class ProgressBar {
    public bar: Bar;
    public constructor() {
        this.bar = new Bar(
            {
                format: "[{bar}] {percentage}% | {message}",
            }, Presets.rect,
        );
    }
    public progress(ratio?: number, message?: string): void {
        const payload = { message: (typeof message !== "string") ? "" : message.length > 30 ? message.slice(0, 30) + " ..." : message };
        if (ratio) {
            this.bar.update(ratio, payload);
        } else if (payload) {
            this.bar.update(payload);
        }
    }
    public start(total: number, startValue: number): void {
        this.bar.start(total, startValue, { message: "" });
    }
    public stop(): void {
        this.bar.stop();
    }
}
