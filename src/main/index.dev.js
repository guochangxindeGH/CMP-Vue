/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Install `electron-debug` with `devtron`
//安装`electron-debug`工具
require('electron-debug')({ showDevTools: true })

// Install `vue-devtools`
let needVueTool = false
if (needVueTool) {
    // 默认关闭vue-devtools开发工具，该工具需要联网下载，一般都无法下载成功
    //安装Vue的一个chrome开发工具`vue-devtools`
    require('electron').app.on('ready', () => {
        let installExtension = require('electron-devtools-installer')
        installExtension.default(installExtension.VUEJS_DEVTOOLS)
            .then(() => {})
            .catch(err => {
                console.log('Unable to install `vue-devtools`: \n', err)
            })
    })
}
// Require `main` process to boot app
require('./index')