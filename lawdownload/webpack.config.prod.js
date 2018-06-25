"use strict";

const HtmlWebPackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    mode: "production",
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist-prod"
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: { minimize: true }
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
                            minimize: true,
                            importLoaders: 2
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {

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
                            minimize: true,
                            importLoaders: 2
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {

                            plugins: () => [require('autoprefixer')]
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {

                        }
                    }
                ]),
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
};