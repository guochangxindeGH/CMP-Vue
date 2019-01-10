import { app, BrowserWindow, webContents, ipcMain } from 'electron'
import {fork} from 'child_process'
import Log from 'electron-log'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
/**
 * 这是主进程的入口文件，用于加载Render进程生成出来的页面文件
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
/**
 * 登陆窗口大小
 * @type {[number,number]}
 */
const LoginWindowSize = [500, 340]

/**
 * 这是一个空窗口，需要加载packageProcessor.js文件来进行IPC通讯
 */
let packageProcessorWindow

/**
 * 数据库所在的独立进程
 */
let dbProcess

// 开发环境的页面渲染到端口上，而生产环境会把文件渲染到html文件中
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

// Db子线程的文件会被webpack写入到dbConfig的Output文件中
const dbFile = require('path').join(__dirname, '../../dist/dbProcessor/dbProcessor.js')

// package数据解析
const packageProcessorUrl = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/packageEntry.html`
    : `file://${__dirname}/packageEntry.html`;

function onMainProcessReady() {
    initLogConfig();
    createWindows();
    handleMessage();
}

function initLogConfig() {
    Log.transports.file.level = 'info';
    Log.transports.file.format = '{y}-{m}-{d}-{h}:{i}:{s}:{ms}--{text}';
    //log文件最大限制
    Log.transports.file.maxSize = 5 * 1024 * 1024;
    //log文件路径
    Log.transports.file.file = __dirname + '../../../rendererLog.log';
    //文件读取方式，覆盖/附加
    Log.transports.file.streamConfig = {flags: 'a+'};
    Log.transports.console.level = false;
}

/**
 * 创建窗口
 */
function createWindows() {
    Log.info('创建窗口');
    createWindow();
    createPackageProcessorWindow();
    createDatabaseThread();
}

//处理消息数据
function handleMessage() {
    ipcMain.on('sendPackStepA', (event, arg) => {
        //此处接收由显示用进程发送来的订阅或查询接口,转发给数据处理进程
        packageProcessorWindow.webContents.send('sendPackage', arg);
    });

    ipcMain.on('dataChange', (event, arg) => {
        //此处接收由进程发送来的通知，需要通知给显示用进程
        let allWebs = webContents.getAllWebContents();
        allWebs.forEach((web, index) => {
            if (packageProcessorWindow !== null) {
                if (packageProcessorWindow.id !== web.id) {
                    // 发送给除了消息来源以外的其他窗口
                    web.send('dataChange', arg);
                }
            }
        });
    });
    ipcMain.on('resizeMainWindowSizeMsg', resizeMainWindowSize);
}

/**
 * 调整主窗口大小
 */
function resizeMainWindowSize(event, windowOpt) {
    if (windowOpt.isLoginScreen === true) {
        // 登陆界面固定大小
        mainWindow.setSize(LoginWindowSize[0], LoginWindowSize[1]);
        // 不可调节窗口
        mainWindow.setResizable(false);
        mainWindow.center();
    } else {
        // 可以调节大小
        mainWindow.setResizable(true);
        if (windowOpt.maxWindow) {
            // 主界面最大化
            mainWindow.maximize();
        } else if (windowOpt.minWindow) {
            mainWindow.minimize();
        } else if (windowOpt.quiteApp) {

        }
    }
}

function createWindow () {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        width: LoginWindowSize[0],
        height: LoginWindowSize[1],
        frame: false,
        resizable: false,
        useContentSize: true
    })

    mainWindow.loadURL(winURL)
    // mainWindow.webContents.closeDevTools()

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

function createPackageProcessorWindow() {
    packageProcessorWindow = new BrowserWindow({
        height: 563,
        useContentSize: true,
        width: 1000,
        title: '数据解析窗口',
        show: false
    });

    packageProcessorWindow.loadURL(packageProcessorUrl);
    // packageProcessorWindow.webContents.closeDevTools();

    packageProcessorWindow.on('closed', () => {
        packageProcessorWindow = null;
    });
}

function createDatabaseThread() {
    dbProcess = fork(dbFile);
}


app.on('ready', onMainProcessReady)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
      onMainProcessReady()
  }
})

app.on('quit', () => {
    dbProcess.kill();
});
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
