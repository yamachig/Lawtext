
import path from "path";
import webpack from "webpack";
import TerserPlugin from "terser-webpack-plugin";

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
        "browser",
    );
    return {
        mode: (argv.mode === "development") ? "development" : "production",
        entry: {
            index: [
                path.resolve(rootDir, "../core/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
                path.resolve(rootDir, "./src/lawtext.ts"),
            ],
        },
        experiments: {
            outputModule: true,
        },
        output: {
            filename: "lawtext.js",
            path: distDir,
            clean: true,
            library: {
                type: "module",
            },
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
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                }),
            ],
        },
    };
};
