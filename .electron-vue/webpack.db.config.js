'use strict';

process.env.BABEL_ENV = 'dbThread';

const path = require('path');
const {dependencies} = require('../package.json');
const webpack = require('webpack');

const BabiliWebpackPlugin = require('babili-webpack-plugin');

let dbConfig = {
    entry: {
        dbProcessor: path.join(__dirname, '../src/dbProcessor/dbProcessor.js')
    },
    externals: [
        ...Object.keys(dependencies || {})
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            }
        ]
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production',
        __filename: process.env.NODE_ENV !== 'production'
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist/dbProcessor')
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin()
    ],
    resolve: {
        extensions: ['.js', '.json', '.node']
    },
    // 不同的target会被webpack加载不同的插件
    // https://github.com/webpack/webpack/blob/master/lib/WebpackOptionsApply.js#L70-L185
    target: 'electron-renderer'
};

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
    dbConfig.plugins.push(
        new webpack.DefinePlugin({
            '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
        })
    );
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
    dbConfig.plugins.push(
        new BabiliWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        })
    );
}

module.exports = dbConfig;
