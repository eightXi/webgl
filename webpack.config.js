var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const entry = ['chapter2', 'chapter3', 'chapter4', 'chapter5', 'chapter6', 'chapter7']
const entryData = {};
const HtmlWebpackPluginData = [];
entry.forEach(function (item) {
    HtmlWebpackPluginData.push(
        new HtmlWebpackPlugin({
            filename: `${item}.html`,
            template: path.join(__dirname, `./src/pages/${item}/index.html`),
            chunks: [item]
        })
    );
    entryData[item] = path.join(__dirname, `./src/pages/${item}/index.js`);
})  
module.exports = {
    mode: 'development',
    entry: { ...entryData },
    output: {
        filename: 'public/[name].js',
        path: path.join(__dirname, `./dist/`),
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'postcss-loader']
            })
        }, {
            test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
            loader: 'file-loader',
            query: {
                name: '[name].[ext]'
            }
        }, {
            test: /\.glsl$/,
            loader: 'raw-loader'
        }]
    },
    resolve: {
        alias: {
            '#': path.join(__dirname, 'src')
        }
    },
    devServer: {
        historyApiFallback: false,
        noInfo: true,
        compress: true,
        hot: true,
    },
    devtool: '#source-map',
    plugins: [
        ...HtmlWebpackPluginData
    ]
}