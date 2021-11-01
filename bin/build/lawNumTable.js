import fs from "fs";
import sha512 from "hash.js/lib/hash/sha/512.js";
import path from "path";
import { promisify } from "util";
import { DOMParser } from "@xmldom/xmldom";
import fetch from "node-fetch";
import { defaultBasePath } from "./defaultBasePath.js";

const KEY_LENGTH = 7;
const LEN_LENGTH = 2;

/**
 * @param {number} num
 * @param {number} size
 */
const pad16 = (num, size) => {
    let s = num.toString(16);
    while (s.length < (size || LEN_LENGTH)) s = "0" + s;
    return s;
};

/**
 * @param {string} basePath
 */
export const buildLawNumTable = async (basePath = defaultBasePath) => {
    const srcPath = path.join(basePath, "src");
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

    /** @type {Map<string, string>} */
    const data = new Map() ;

    let table = "";
    for (const law of laws) {
        /** @type {string} */
        const digest = sha512().update(law.num).digest("hex");
        const key = digest.slice(0, KEY_LENGTH);
        if (data.has(key)) {
            console.error(`collision: ${law.num} ${law.name} key:${key}`);
        }
        const length = law.name.length;
        const value = key + pad16(length, LEN_LENGTH);
        data.set(key, value);
        table += value;
    }

    await promisify(fs.writeFile)(path.join(srcPath, "lawnum_table.ts"), `
"use strict";

export const LAWNUM_TABLE: { [key: string]: number } = {};

const LAWNUM_TABLE_RAW = "${table}";

export const KEY_LENGTH = ${KEY_LENGTH};

const LEN_LENGTH = ${LEN_LENGTH};

for(let i = 0; i < LAWNUM_TABLE_RAW.length; i += KEY_LENGTH + LEN_LENGTH) {
    const key = parseInt(LAWNUM_TABLE_RAW.slice(i, i + KEY_LENGTH), 16);
    const length = parseInt(LAWNUM_TABLE_RAW.slice(i + KEY_LENGTH, i + KEY_LENGTH + LEN_LENGTH), 16);
    LAWNUM_TABLE[key] = length;
}
`.trimLeft());
};

if (typeof require !== "undefined" && require.main === module) {
    buildLawNumTable().catch(console.error);
}
