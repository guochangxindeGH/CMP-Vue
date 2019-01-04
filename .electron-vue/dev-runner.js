'use strict'

const chalk = require('chalk')
const electron = require('electron')
const path = require('path')
const { say } = require('cfonts')
const { spawn } = require('child_process')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackHotMiddleware = require('webpack-hot-middleware')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')
const dbConfig = require('./webpack.db.config');

let electronProcess = null
let manualRestart = false
let hotMiddleware

function logStats (proc, data) {
  let log = ''

  log += chalk.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`)
  log += '\n\n'

  if (typeof data === 'object') {
    data.toString({
      colors: true,
      chunks: false
    }).split(/\r?\n/).forEach(line => {
      log += '  ' + line + '\n'
    })
  } else {
    log += `  ${data}\n`
  }

  log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'

  console.log(log)
}


//渲染进程启动过程分析

//在这个方法里，共完成了三个操作：
//
// 创建webpack对象
// 利用webpack对象来创建W**ebpackDevServer对象
// 监听webpack编译过程
function startRenderer () {
  return new Promise((resolve, reject) => {
      //加载webpack配置文件
      rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer)
      // render的配置文件为/src/renderer/main.js，在这里为开发环境额外添加 dev-client.js 配置文件
      rendererConfig.entry.packageEntry = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.packageEntry);
      rendererConfig.mode = 'development'
      //创建webpack
      const compiler = webpack(rendererConfig)
      //创建webpack-hot-middleware
      hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 2500
    })

      //编译状态监控
      compiler.hooks.compilation.tap('compilation', compilation => {
      compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync('html-webpack-plugin-after-emit', (data, cb) => {
          //检测webpack的编译状态
        hotMiddleware.publish({ action: 'reload' })
        cb()
      })
    })

    compiler.hooks.done.tap('done', stats => {
        //输出编译过程
      logStats('Renderer', stats)
    })

      //创建webpack-dev-server
      const server = new WebpackDevServer(
      //以webpack对象作为参数
      compiler,
      {
        contentBase: path.join(__dirname, '../'),
        quiet: true,
        before (app, ctx) {
            //使用webpackHotMiddleware
            app.use(hotMiddleware)
            ctx.middleware.waitUntilValid(() => {
                resolve()
          })
        }
      }
    )
    //服务器运行在9080端口
    server.listen(9080)
  })
}

//主进程启动过程
function startMain () {
  return new Promise((resolve, reject) => {
      // main进程的配置文件为/src/main/index.js，在这里为开发环境额外添加 index.dev.js 的配置文件，作用是为主进程安装vue的开发工具
      mainConfig.entry.main = [path.join(__dirname, '../src/main/index.dev.js')].concat(mainConfig.entry.main)
      mainConfig.mode = 'development'
      //创建主进程的webpack
      const compiler = webpack(mainConfig)

    compiler.hooks.watchRun.tapAsync('watch-run', (compilation, done) => {
      logStats('Main', chalk.white.bold('compiling...'))
        //向webpack-hot-middleware发布"compiling"的消息，用于页面显示
      hotMiddleware.publish({ action: 'compiling' })
      done()
    })

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err)
        return
      }

      logStats('Main', stats)

      if (electronProcess && electronProcess.kill) {
          //主进程文件发生改变，重启Electron
          manualRestart = true
        process.kill(electronProcess.pid)
        electronProcess = null
        startElectron()

        setTimeout(() => {
          manualRestart = false
        }, 5000)
      }

      resolve()
    })
  })
}

function startElectron () {
  var args = [
    '--inspect=5858',
    path.join(__dirname, '../dist/electron/main.js')
  ]

  // detect yarn or npm and process commandline args accordingly
  if (process.env.npm_execpath.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3))
  } else if (process.env.npm_execpath.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2))
  }

  electronProcess = spawn(electron, args)
  
  electronProcess.stdout.on('data', data => {
    electronLog(data, 'blue')
  })
  electronProcess.stderr.on('data', data => {
    electronLog(data, 'red')
  })

  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}

function electronLog (data, color) {
  let log = ''
  data = data.toString().split(/\r?\n/)
  data.forEach(line => {
    log += `  ${line}\n`
  })
  if (/[0-9A-z]+/.test(log)) {
    console.log(
      chalk[color].bold('┏ Electron -------------------') +
      '\n\n' +
      log +
      chalk[color].bold('┗ ----------------------------') +
      '\n'
    )
  }
}

//  在终端输出一个Log
function greeting () {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 104) text = 'electron-vue'
  else if (cols > 76) text = 'electron-|vue'
  else text = false

  if (text) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false
    })
  } else console.log(chalk.yellow.bold('\n  electron-vue'))
  console.log(chalk.blue('  getting ready...') + '\n')
}

/**
 * Db线程，如果发生改变，需要重启Electron
 * @returns {Promise}
 */
function startDb() {
    return new Promise((resolve, reject) => {
        dbConfig.mode = 'development';
        const compiler = webpack(dbConfig);


        compiler.hooks.watchRun.tapAsync('watch-run', (compilation, done) => {
            logStats('Db', chalk.white.bold('compiling...'));
            hotMiddleware.publish({action: 'compiling'});
            done();
        });

        compiler.watch({}, (err, stats) => {
            if (err) {
                console.log(err);
                return;
            }

            logStats('Db', stats);

            if (electronProcess && electronProcess.kill) {
                manualRestart = true;
                process.kill(electronProcess.pid);
                electronProcess = null;
                startElectron();

                setTimeout(() => {
                    manualRestart = false;
                }, 5000);
            }

            resolve();
        });
    });
}

function init () {
  greeting()

  Promise.all([startRenderer(), startDb(), startMain()])
    .then(() => {
      startElectron()
    })
    .catch(err => {
      console.error(err)
    })
}

init()
