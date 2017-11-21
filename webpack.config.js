const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const entryPoint = './client/entry-point';

console.log('1', `entryPoint = ${entryPoint}`);
console.log('1', `__dirname = ${__dirname}`);

module.exports = {
    entry: `${entryPoint}/index.js`,

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
            template: `${entryPoint}/index.html`,
            inject: "body"
        })
    ]
};