import { Application, TSConfigReader, TypeDocReader } from "typedoc";
import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";
import { promisify } from "util";

const prepareTempIncludes = async (dir: string, tempIncludesDir: string, relpath = "./") => {
    for (const item of await promisify(fs.readdir)(dir, { withFileTypes: true })) {
        if (item.isDirectory()) {
            await prepareTempIncludes(
                path.join(dir, item.name),
                tempIncludesDir,
                path.join(relpath, item.name),
            );
        } else if (item.isFile()) {
            if (path.extname(item.name) === ".ts") {
                const text = await promisify(fs.readFile)(path.join(dir, item.name), { encoding: "utf-8" });
                const lines: string[] = [];
                let currentIndent = "";
                for (const line of text.replace(/\/\*\s*\[\s*md-ignore-start\s*\]\*\/.*?\/\*\s*\[\s*md-ignore-end\s*\]\*\//g, "").split(/\r?\n/)) {
                    const mIgnore = /\/\/\s*\[\s*md-ignore\s*\]/.exec(line);
                    if (mIgnore) continue;
                    if (mIgnore) continue;
                    const m = /^(\s*)\/\/\s*\[\s*md\s*\](.*)$/.exec(line);
                    if (m) {
                        lines.push(m[2]);
                        currentIndent = m[1];
                    } else if (line.startsWith(currentIndent)) {
                        lines.push(line.slice(currentIndent.length));
                    } else {
                        lines.push(line);
                    }
                }
                const replacedText = lines.join("\r\n");//text.replace(/^[ \f\t\v]*\/\/[ \f\t\v]*\[[ \f\t\v]*md[ \f\t\v]*\]/mg, "");
                await promisify(fs.writeFile)(
                    path.join(
                        tempIncludesDir,
                        relpath,
                        `${path.basename(item.name, path.extname(item.name))}.md`,
                    ),
                    replacedText,
                );
            }
        }
    }
};

export const generateDocs = async (targetDir: string): Promise<void> => {
    const app = new Application();
    app.options.addReader(new TypeDocReader());
    app.options.addReader(new TSConfigReader());

    const tempIncludesDir = path.join(__dirname, "./temp-includes");

    app.bootstrap({
        entryPoints: [path.join(__dirname, "../globals/")],
        entryPointStrategy: "expand",
        // excludePrivate: true,
        // excludeProtected: true,
        // excludeInternal: true,
        excludeNotDocumented: true,
        name: "Lawtext query",
        readme: path.join(__dirname, "./src/readme.md"),
        includes: tempIncludesDir,
        out: targetDir,
    });

    const project = app.convert();
    if (!project) throw new Error("Error on typedoc.Application.convert()");

    if (await promisify(fs.exists)(tempIncludesDir)) await promisify(fs.rmdir)(tempIncludesDir, { recursive: true });
    await fsExtra.ensureDir(tempIncludesDir);
    await prepareTempIncludes(path.join(__dirname, "./src"), tempIncludesDir);

    await app.generateDocs(project, app.options.getValue("out"));
};

const main = async (): Promise<void> => {
    const yargs = await import("yargs");

    const args = await yargs
        .option("target-dir", {
            type: "string",
            demandOption: true,
            alias: "td",
        })
        .argv;

    await generateDocs(args["target-dir"]);
};


if (typeof require !== "undefined" && require.main === module) {
    process.on("unhandledRejection", e => {
        console.dir(e);
        process.exit(1);
    });
    main().catch(e => { throw e; });
}

