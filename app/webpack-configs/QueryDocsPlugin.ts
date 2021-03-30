import webpack from "webpack";
import path from "path";
import { generateDocs } from "@appsrc/query-docs";


export default class QueryDocsPlugin {
    public apply(compiler: webpack.Compiler): void {
        compiler.hooks.afterEmit.tapPromise("CreateAppZipPlugin", async () => {
            const targetDir = path.join(compiler.outputPath, "query-docs");
            await generateDocs(targetDir);
        });
    }
}
