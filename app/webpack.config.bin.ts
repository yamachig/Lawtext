import * as Autoprefixer from "autoprefixer"
import * as CircularDependencyPlugin from "circular-dependency-plugin"
import * as HtmlWebPackPlugin from "html-webpack-plugin"
import * as MiniCssExtractPlugin from "mini-css-extract-plugin"
import * as CssMinimizerPlugin  from "css-minimizer-webpack-plugin"
import * as path from 'path';
import * as webpack from 'webpack';
import * as nodeExternals from "webpack-node-externals"

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
    entry: ["./bin/index.ts"],
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist-bin"),
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
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
        // new HtmlWebPackPlugin({
        //     template: "./src/index.html",
        //     filename: "index.html",
        // }),
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
