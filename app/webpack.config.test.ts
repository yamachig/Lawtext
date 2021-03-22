import Autoprefixer from "autoprefixer"
import CircularDependencyPlugin from "circular-dependency-plugin"
import HtmlWebPackPlugin from "html-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import CssMinimizerPlugin  from "css-minimizer-webpack-plugin"
import path from 'path';
import webpack from 'webpack';
import nodeExternals from "webpack-node-externals"

class WatchMessagePlugin {
    public apply(compiler) {
        compiler.hooks.watchRun.tap("WatchMessagePlugin", () => {
            console.log("\x1b[36m" + "Begin compile at " + new Date() + " \x1b[39m");
        });
        compiler.hooks.done.tap("WatchMessagePlugin", () => {
            setTimeout(() => {
                console.log("\x1b[36m" + "Done compile at " + new Date() + " \x1b[39m");
            }, 30);
        });
    }
}

export default (env, argv) => ({
    target: "node",
    entry: ["./test/setup.ts", "./test/components.ts"],
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist-test"),
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
            "@appsrc": path.resolve(__dirname, "./src"),
            "@coresrc": path.resolve(__dirname, "../core/src"),
        },
        fallback: { 
            "path": require.resolve("path-browserify"),
        },
    },
    externals: [nodeExternals()],
    node: {
        __dirname: false,
    },

    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
            // new TerserPlugin(),
        ],
    },

    module: {
        rules: [
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
                                plugins: [
                                    "autoprefixer",
                                ],
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
        ]
    },

    plugins: [
        new WatchMessagePlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "index.html",
        }),
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true,
            cwd: process.cwd(),
        }),
    ],

    watchOptions: {
        ignored: [
            "node_modules",
            "dist-dev",
            "dist-prod",
            "dist-test",
            "dist-bin",
        ],
    },

    devtool: "source-map",
} as webpack.Configuration);
