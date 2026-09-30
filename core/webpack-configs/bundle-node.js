
import path from "path";
import webpack from "webpack";

const rootDir = path.dirname(import.meta.dirname);

/**
 * @param {Record<string, any>} env
 * @param {Record<string, any>} argv
 * @returns {import("webpack").Configuration}
 * */
export default (env, argv) => {
    const distDir = path.resolve(
        rootDir,
        (argv.mode === "development") ? "dist-bundle-dev" : "dist-bundle-prod",
    );
    return {
        target: "node",
        mode: (argv.mode === "development") ? "development" : "production",
        devtool: (argv.mode === "development") ? "inline-source-map" : false,
        entry: [path.resolve(rootDir, "./src/main.ts")],
        experiments: {
            outputModule: true,
        },
        output: {
            filename: "node/lawtext_cli.mjs",
            path: distDir,
            module: true,
            chunkFormat: "module",
            library: {
                type: "module",
            },
        },
        externalsType: "import",
        externals: {
            "pdfjs-dist/legacy/build/pdf.mjs": "pdfjs-dist/legacy/build/pdf.mjs",
            "@napi-rs/canvas": "@napi-rs/canvas",
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            extensionAlias: {
                ".js": [".js", ".ts", ".tsx"],
            },
            alias: {
                "./createPdfjsWorker.js$": false,
            },
        },
        module: {
            rules: [{ test: /\.tsx?$/, use: "ts-loader" }],
        },
        plugins: [
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),
        ],
        optimization: {
            concatenateModules: false,
        },
    };
};
