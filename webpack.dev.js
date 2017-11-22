const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const common = require('./webpack.config.js');

const NODE_ENV = 'development';

module.exports = merge(common, {
    entry: [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client',
        // 'webpack-hot-middleware/client?reload=true',
        path.resolve(__dirname, './client/entry-point/index.js'),
    ],

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
        publicPath: "/"
    },

    devtool: 'eval',

    module: {
        rules: [
            {
                test: /\.html$/,
                include: [path.resolve(__dirname, './client/entry-point')],
                loader: 'html-loader?minimize=false'
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {loader: 'css-loader', options: {importLoaders: 1}},
                        'postcss-loader',
                        'sass-loader'
                    ]
                })
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin({disable: true})
    ]
});