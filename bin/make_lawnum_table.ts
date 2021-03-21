import * as fs from "fs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sha512 from "hash.js/lib/hash/sha/512";
import * as path from "path";
import { promisify } from "util";
import { DOMParser } from "xmldom";
import fetch from "node-fetch";

const pad16 = (num: number, size: number) => {
    let s = num.toString(16);
    while (s.length < (size || 2)) s = "0" + s;
    return s;
};

const main = async (): Promise<void> => {
    const response = await fetch(
        "https://elaws.e-gov.go.jp/api/1/lawlists/1",
        {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
            },
        },
    );
    const xml = await response.text();
    const parser = new DOMParser();

    const tree = parser.parseFromString(xml);
    const laws = Array.from(tree.getElementsByTagName("LawNameListInfo")).map(law => {
        const LawNameEL = law.getElementsByTagName("LawName").item(0);
        const rawLawName = (LawNameEL && LawNameEL.textContent) || "";
        // eslint-disable-next-line no-irregular-whitespace
        const lawName = rawLawName.replace(/　抄$/, "");
        const LawNoEL = law.getElementsByTagName("LawNo").item(0);
        const lawNo = (LawNoEL && LawNoEL.textContent) || "";
        return {
            name: lawName,
            num: lawNo,
        };
    });

    const data = new Map<string, string>();
    let table = "";
    for (const law of laws) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const digest = sha512().update(law.num).digest("hex") as string;
        const key = digest.slice(0, 7);
        if (data.has(key)) {
            console.error(`collision: ${law.num} ${law.name} key:${key}`);
        }
        const length = law.name.length;
        const value = key + pad16(length, 2);
        data.set(key, value);
        table += value;
    }

    await promisify(fs.writeFile)(path.join(__dirname, "..", "src", "lawnum_table.ts"), `
"use strict";

export const LAWNUM_TABLE: { [key: string]: number } = {};

const LAWNUM_TABLE_RAW =  "${table}";

for(let i = 0; i < LAWNUM_TABLE_RAW.length; i += 9) {
    const key = parseInt(LAWNUM_TABLE_RAW.slice(i, i + 7), 16);
    const length = parseInt(LAWNUM_TABLE_RAW.slice(i + 7, i + 9), 16);
    LAWNUM_TABLE[key] = length;
}
`.trimLeft());
};

export default main;

if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", e => {
        console.dir(e);
        process.exit(1);
    });
    main().catch(e => { throw e; });
}