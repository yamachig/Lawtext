import HtmlWebPackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import path from "path";
import webpack from "webpack";
import WatchMessagePlugin from "./WatchMessagePlugin.ts";
import QueryDocsPlugin from "./QueryDocsPlugin.ts";
import TerserPlugin from "terser-webpack-plugin";

const rootDir = path.dirname(import.meta.dirname);

export default (env: Record<string, string>, argv: Record<string, string>): webpack.Configuration => {
    const distDir = path.resolve(rootDir, "dist-" + (argv.mode === "production" ? "prod" : "dev") + "-local");
    const config: webpack.Configuration = {
        entry: {
            index: [
                path.resolve(rootDir, "../core/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
                path.resolve(rootDir, "./src/index.tsx"),
            ],
        },
        output: {
            filename: "[name].js",
            path: distDir,
            clean: true,
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            extensionAlias: {
                ".js": [".js", ".ts", ".tsx"],
            },
            alias: {
                "./createPdfjsWorker.js$": false,
            },
            fallback: {
                "buffer": import.meta.resolve("buffer/"),
            },
        },

        optimization: {
            minimizer: [
                new CssMinimizerPlugin(),
                new TerserPlugin(),
            ],
            runtimeChunk: false,
            splitChunks: {
                cacheGroups: {
                    anyModulesGroup: {
                        test: () => true,
                        name: "index",
                        chunks: "all",
                        priority: 30,
                        enforce: true,
                    },
                },
            },
        },

        module: {
            rules: [
                {
                    test: /\.(?:jsx?|tsx?)$/,
                    enforce: "pre",
                    use: ["source-map-loader"],
                },
                { test: /\.tsx?$/, loader: "ts-loader" },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader",
                        },
                    ],
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: ["autoprefixer"],
                                },
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sassOptions: {
                                    quietDeps: true,
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.xml$/,
                    loader: "raw-loader",
                },
            ],
        },

        plugins: [
            new webpack.ProvidePlugin({
                Buffer: ["buffer", "Buffer"],
            }),
            new webpack.DefinePlugin({
                "import.meta.url": webpack.DefinePlugin.runtimeValue(() => {
                    return "(document.currentScript && document.currentScript.src || location.href)";
                }, []),
            }),
            new WatchMessagePlugin(),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css",
            }),
            new HtmlWebPackPlugin({
                template: path.resolve(rootDir, "./src/index.ejs"),
                filename: "index.html",
            }),
            new QueryDocsPlugin(),
        ],

        watchOptions: {
            ignored: [
                "node_modules",
                "dist-dev",
                "dist-prod",
                "dist-dev-local",
                "dist-prod-local",
                "dist-test",
                "dist-bin",
            ],
        },

        devtool: "source-map",
    };
    return config;
};
