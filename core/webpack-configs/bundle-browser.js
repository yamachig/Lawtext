const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

const rootDir = path.dirname(__dirname);

/** @returns {import("webpack").Configuration} */
module.exports = (env, argv) => {
    const distDir = path.resolve(
        rootDir,
        (argv.mode === "development") ? "dist-bundle-dev" : "dist-bundle-prod",
    );
    return {
        mode: (argv.mode === "development") ? "development" : "production",
        entry: [path.resolve(rootDir, "./src/lawtext.ts")],
        output: {
            filename: "browser/lawtext.js",
            path: distDir,
            library: {
                name: "lawtext",
                type: "umd",
            },
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                "node-fetch": false,
            },
            fallback: {
                "path": require.resolve("path-browserify"),
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
