import type webpack from "webpack";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import fsExtra from "fs-extra";
import type { AsyncZippable } from "lawtext/dist/src/util/zip";
import { zip } from "lawtext/dist/src/util/zip";

async function *iterDirTree(dir: string, ignore: string[] = []): AsyncGenerator<string> {
    for (const item of await promisify(fs.readdir)(dir, { withFileTypes: true })) {
        const itemStr = path.join(dir, item.name);
        if (ignore.includes(itemStr)) continue;
        if (item.isDirectory()) yield* iterDirTree(itemStr, ignore);
        if (item.isFile()) yield itemStr;
    }
}

export default class CreateAppZipPlugin {
    public apply(compiler: webpack.Compiler): void {
        compiler.hooks.afterEmit.tapPromise("CreateAppZipPlugin", async () => {
            const relAppPath = path.join("asset", "Lawtext-app.zip");
            const ignore = [
                "data",
                relAppPath,
            ].map(p => path.join(compiler.outputPath + "-local", p));

            console.info(`Creating ${relAppPath} ...`);

            const zipData: AsyncZippable = {};
            for await (const file of iterDirTree(compiler.outputPath + "-local", ignore)) {
                const relPath = path.relative(compiler.outputPath + "-local", file);
                const buf = await promisify(fs.readFile)(file);
                console.info(`   Add ${relPath} (${buf.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} bytes) ...`);
                zipData[relPath] = buf;
            }
            const buf = await zip(zipData, { level: 9 });

            const absAppPath = path.join(compiler.outputPath, relAppPath);
            await promisify(fsExtra.ensureDir)(path.dirname(absAppPath));
            await promisify(fs.writeFile)(absAppPath, buf);

            console.info(`Created ${relAppPath} (${buf.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} bytes)`);
        });
    }
}
