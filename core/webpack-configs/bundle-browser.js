/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @stylistic/js/quote-props */
import path from "path";
import webpack from "webpack";
import TerserPlugin from "terser-webpack-plugin";

const rootDir = path.dirname(import.meta.dirname);

/** @returns {import("webpack").Configuration} */
export default (env, argv) => {
    const distDir = path.resolve(
        rootDir,
        (argv.mode === "development") ? "dist-bundle-dev" : "dist-bundle-prod",
    );
    return {
        mode: (argv.mode === "development") ? "development" : "production",
        entry: [path.resolve(rootDir, "./src/lawtext.ts")],
        experiments: {
            outputModule: true,
        },
        output: {
            filename: "browser/lawtext.js",
            path: distDir,
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
                "node-fetch": false,
                "fs": false,
                "canvas": false,
                "pdfjs-dist": false,
            },
            fallback: {
                "path": import.meta.resolve("path-browserify"),
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
