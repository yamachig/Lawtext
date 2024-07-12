import HtmlWebPackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import path from "path";
import webpack from "webpack";
import WatchMessagePlugin from "./WatchMessagePlugin";
import QueryDocsPlugin from "./QueryDocsPlugin";

const rootDir = path.dirname(__dirname);

export default (env: Record<string, string>, argv: Record<string, string>): webpack.Configuration => {
    const distDir = path.resolve(rootDir, "dist-" + (argv.mode === "production" ? "prod" : "dev") + "-local");
    const config: webpack.Configuration = {
        entry: {
            index: [path.resolve(rootDir, "./src/index.tsx")],
            "pdf.worker": "../core/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
        },
        output: {
            filename: "bundle.[name].js",
            path: distDir,
            clean: argv.mode === "production",
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                "@appsrc": path.resolve(rootDir, "./src"),
                "node-fetch": false,
                "canvas": false,
                "fs": false,
                "cli-progress": false,
                "string_decoder": false,
            },
            fallback: {
                "path": require.resolve("path-browserify"),
                "buffer": require.resolve("buffer/"),
            },
        },

        optimization: {
            minimizer: [new CssMinimizerPlugin()],
        },

        module: {
            rules: [
                // {
                //     test: /\.(?:jsx?|tsx?)$/,
                //     enforce: "pre",
                //     use: ["source-map-loader"],
                // },
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
                        "sass-loader",
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
            new WatchMessagePlugin(),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css",
            }),
            new HtmlWebPackPlugin({
                template: path.resolve(rootDir, "./src/index.html"),
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
