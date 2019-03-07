'use strict'

const path = require('path')
const merge = require('webpack-merge')
const webpack = require('webpack')

const baseConfig = require('../../.electron-vue/webpack.renderer.config')
const projectRoot = path.resolve(__dirname, '../../src/renderer')

// Set BABEL_ENV to use proper preset config
process.env.BABEL_ENV = 'test'

let webpackConfig = merge(baseConfig, {
    devtool: '#inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"testing"'
        })
    ]
})

// don't treat dependencies as externals
delete webpackConfig.entry
delete webpackConfig.externals
delete webpackConfig.output.libraryTarget

// apply vue option to apply isparta-loader on js
webpackConfig.module.rules
    .find(rule => rule.use.loader === 'vue-loader').use.options.loaders.js = 'babel-loader'

module.exports = config => {
    config.set({
        // 浏览器
        browsers: ['visibleElectron'],
        client: {
            useIframe: false
        },
        // 测试覆盖率报告
        // https://github.com/karma-runner/karma-coverage/blob/master/docs/configuration.md
        coverageReporter: {
            dir: './coverage',
            reporters: [
                { type: 'lcov', subdir: '.' },
                { type: 'text-summary' }
            ]
        },
        customLaunchers: {
            'visibleElectron': {
                base: 'Electron',
                flags: ['--show']
            }
        },
        // 测试框架
        frameworks: ['mocha', 'chai'],
        // 测试入口文件
        files: ['./index.js'],
        // 预处理器 karma-webpack
        preprocessors: {
            './index.js': ['webpack', 'sourcemap']
        },
        // 测试报告
        reporters: ['spec', 'coverage'],
        singleRun: true,
        // Webpack配置
        webpack: webpackConfig,
        // Webpack中间件
        webpackMiddleware: {
            noInfo: true
        }
    })
}
