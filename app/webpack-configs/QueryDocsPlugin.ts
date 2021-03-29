import webpack from "webpack";
import { promisify } from "util";
import path from "path";
import { exec } from "child_process";

export default class QueryDocsPlugin {
    public apply(compiler: webpack.Compiler): void {
        compiler.hooks.afterEmit.tapPromise("CreateAppZipPlugin", async () => {
            const targetDir = path.join(compiler.outputPath, "query-docs");
            await (promisify(exec))(`npx typedoc ../core/src/data/query.ts src/globals.ts --plugin none --excludeNotDocumented --name "Lawtext query" --readme "src/query-docs-readme-src.md" --out "${targetDir}" --theme default`);
        });
    }
}
