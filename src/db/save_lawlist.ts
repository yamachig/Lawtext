import { promisify } from "util";
import fs from "fs";
import path from "path";
import { makeList } from "@coresrc/db/lawlist";

export const saveList = async (
    lawdataDir: string, listJsonPath: string,
    onProgress: (ratio: number, message: string) => void = () => undefined,
): Promise<void> => {

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio || currentRatio;
            currentMessage = message || currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    console.log("\nListing up XMLs...");
    const dirs = (await promisify(fs.readdir)(lawdataDir, { withFileTypes: true })).filter(p => p.isDirectory()).map(p => path.join(lawdataDir, p.name));
    const files: string[] = [];
    for (const dir of dirs) {
        files.push(...(await promisify(fs.readdir)(dir, { withFileTypes: true })).filter(p => p.isFile() && /\.xml$/.exec(p.name)).map(p => path.join(dir, p.name)));
    }

    console.log(`Processing ${files.length} XMLs...`);

    async function* lawIdXmls(files: string[]) {
        for (const file of files) {
            const lawID = /^[A-Za-z0-9]+/.exec(path.basename(file))?.[0] ?? "";
            const xml = await promisify(fs.readFile)(file, { encoding: "utf-8" });
            const Path = path.basename(path.dirname(file));
            const XmlName = path.basename(file);
            yield { lawID, xml, Path, XmlName };
        }
    }

    const list = await makeList(lawIdXmls(files), files.length, progress);
    await promisify(fs.writeFile)(listJsonPath, JSON.stringify(list), { encoding: "utf-8" });
};
