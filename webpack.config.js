const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, './client/entry-point/index.js'),

    module: {
        rules: [
            {
                test: /.jsx?$/,
                exclude: [/node_modules/],
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: ['url-loader?limit=10000', 'img-loader']
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&mimetype=\'application/font-woff\''
            },
            {
                test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader'
            }
        ]
    },

    plugins: [
        new webpack.IgnorePlugin(/caniuse-lite\/data\/regions/),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './client/entry-point/index.html'),
            inject: "body"
        })
    ]
};