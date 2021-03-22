import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import * as build from "./bin/build";

export class BuildPlugin {
    apply(compiler: webpack.Compiler): void {
        compiler.hooks.run.tapPromise("BuildPlugin", async () => {
            await build.main();
        });
    }
}

export default {
    mode: "development",
    target: "node",
    entry: "./src/lawtext.ts",
    output: {
        filename: "lawtext.js",
        path: __dirname + "/dist-dev",
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    externals: [nodeExternals()],
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [{ test: /\.ts$/, loader: "ts-loader" }],
    },
    plugins: [new BuildPlugin()],
    devtool: "source-map",
};
