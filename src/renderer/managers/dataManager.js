import {ipcRenderer} from 'electron';
import Log from 'electron-log';


let mListenerList = [];
let mAppList = [];
let initCompleted = false;
const LogOpen = true;
const LogTag = 'DataManager';

function makeLog(message) {
    if (!LogOpen) {
        return;
    }
    Log.info('【' + LogTag + '】' + message);
}

function dataChange(event, msg) {
    let packName = msg.packName;
    makeLog('收到服务器包:' + packName);
    if (packName === 'RspError') {
        // 服务器返回Error
        makeLog('服务器返回Error');
        debugger;
    }
    if (packName === 'RspAppLists') {
        mAppList = [];
        let docs = JSON.parse(msg.packInfo);
        for (let i = 0; i < docs.length; i++) {
            let value = docs[i].field.values;
            for (let j = 0; j < value.length; j++) {
                mAppList.push(value[j]);
            }
        }
        makeLog('AppList数据就绪');
    }
}


/**
 * 初始化数据管理器
 */
function initDataManager() {
    if (initCompleted) {
        makeLog('数据管理器已经初始化');
        return;
    }
    initCompleted = true;
    makeLog('进行数据管理器初始化');
    ipcRenderer.on('dataChange', dataChange);
    getAppList();
}

/**
 * 获取当前的App列表
 */
function getAppList() {
    if (mAppList.length > 0) {
        makeLog('Applist数据已经存在，直接返回');
        return mAppList;
    }
    makeLog('查询App列表信息');
    let _queryParam = {
        Null: ''
    };
    ipcRenderer.send('sendPackStepA', {
        packName: 'ReqAppLists',
        opts: _queryParam,
        requestID: 1
    });
}

/*
如果已经被别的订阅，只需要添加监听即可，无需再次向服务器订阅
 */
function addListener(objectId, listener) {
    let _queryParam = {
        Null: ''
    };
    ipcRenderer.send('sendPackStepA', {
        packName: 'ReqAppLists',
        opts: _queryParam,
        requestID: 1111
    });
}

export {initDataManager, getAppList};
