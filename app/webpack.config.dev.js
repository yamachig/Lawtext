"use strict";

const HtmlWebPackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    mode: "development",
    entry: ["./src/polyfills.ts", "./src/index.tsx"],
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist-dev"
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",

                    }
                ]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract([
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                            sourceMap: true,
                            importLoaders: 2
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            plugins: () => [require('autoprefixer')]
                        },
                    }
                ]),
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract([
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                            sourceMap: true,
                            importLoaders: 2
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            plugins: () => [require('autoprefixer')]
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        }
                    }
                ]),
            },
            {
                test: /\.xml$/,
                loader: 'raw-loader'
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    plugins: [
        new ExtractTextPlugin('style.css'),
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "index.html"
        })
    ],

    watchOptions: {
      ignored: /node_modules/
    },

    devtool: "source-map"
};