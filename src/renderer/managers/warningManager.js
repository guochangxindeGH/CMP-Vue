import {ipcRenderer} from 'electron';
import AppUtils from 'dirUtil/AppUtils';
//Todo 暂时关闭休眠功能
// import SleepAPI = from(rootPath + '/src/ui/js/template/warning/sleepWarning.js');
import Log from 'electron-log';
import http from 'http';

const LogOpen = true;
const LogTag = 'WarningManager';
const Timer = 2000;

/**
 * 未知单的关键字
 */
const UnknowOrderKeyWord = 'Unknown Order Occured';

// 忙线
let handleWarngingBusy = false;
// 处理忙线过程中错过了某些告警，需要等闲下来以后补录
let loseWarningItem = false;
let originWarningList = [];

function makeLog(message) {
    if (!LogOpen) {
        return;
    }
    Log.info('【' + LogTag + '】' + message);
}

/**
 * 获取指定项目的告警列表
 * @param flag  N--未处理，Y--已修复，S--已休眠, A--全部
 * @param level 挑选的级别，99--不过滤级别， 1，2，3--正常级别
 * @param beginDate
 * @param endDate
 * @param who  调用者信息，用于Log
 */
function getWarningWithParam(flag = 'N', level = 99, beginDate = '', endDate = '', who = 'anonymous') {
    makeLog('查询告警信息，参数：flag:' + flag + ',level:' + level + ',beginDate:' + beginDate + ',endDate:' + endDate + ',who:' + who);
    if (originWarningList.length < 1) {
        makeLog('原始列表为空，返回空列表');
        return [];
    }

    // makeLog('原始告警条目：' + originWarningList.length);

    let resultList = [];

    let nowString = AppUtils.getDate(new Date());
    let skip_status = 0;
    let skip_level = 0;
    let skip_today = 0;
    let skip_date = 0;
    for (let warningItem of originWarningList) {
        // 跳过已处理
        if (flag !== 'A') {
            if (warningItem.ProcessFlag !== flag) {
                //只统计未处理的事件
                // makeLog('跳过状态不匹配，本条状态：' + warningItem.ProcessFlag + ',目标状态' + flag);
                skip_status++;
                continue;
            }
        }
        if (level !== 99) {
            if (warningItem.WarningLevel.charAt(5) !== level) {
                skip_level++;
                continue;
            }
        }
        if ((beginDate === '') || (endDate !== '')) {
            // 默认只挑选当天的
            if (warningItem.MonDate !== nowString) {
                skip_today++;
                continue;
            }
        } else if ((beginDate !== '') && (endDate !== '')) {
            if (warningItem.OccurDate <= beginDate || warningItem.OccurDate >= endDate) {
                skip_date++;
                continue;
            }
        }
        resultList.push(warningItem);
    }
    makeLog('跳过状态不匹配:' + skip_status);
    makeLog('跳过级别不匹配:' + skip_level);
    makeLog('跳过不是今天的:' + skip_today);
    makeLog('跳过日期不匹配:' + skip_date);
    makeLog('符合条件的告警条目：' + resultList.length);
    return resultList;
}

/**
 * 休眠状态发生改变，需要更新原始列表
 */
function updateSleepStatus() {
    makeLog('告警休眠状态发生改变，更新告警条目');
    onWarningChanged();
}


/**
 * 去掉休眠类告警
 * 去掉已修复的告警
 * 去掉已修复的未知单告警
 */
function handleWarningData(originWarning) {
    if (handleWarngingBusy) {
        loseWarningItem = true;
        makeLog('告警已经在处理中，跳过此次更新');
        return;
    }
    makeLog('准备原始数据');
    handleWarngingBusy = true;
    originWarningList = [];

    for (let index = 0; index < originWarning.length; index++) {
        let field = originWarning[index].field;
        let warningItem = null;
        if (Array.isArray(field)) {
            warningItem = originWarning[index].field[0].values[0];
        } else {
            warningItem = originWarning[index].field.values[0];
        }

        if (warningItem === null) {
            continue;
        }

        /**
         * 处理告警休眠的项目
         if (SleepAPI.eventInSleep(warningItem)) {
            if (warningItem.ProcessFlag === 'N') {
                warningItem.ProcessFlag = 'S';
                makeLog('当前告警被休眠了，状态从N切换为S');
            }
        }
         */

        /**
         * 处理未知单已经修复的项目
         */
        let skipCurrentUnknowItem = false;
        if ((UnknowOrderKeyWord === warningItem.EventName) && (warningItem.ProcessFlag === 'N')) {
            //未知单修复之后会重复告警，因此手动过滤掉
            for (let item of originWarningList) {
                if (UnknowOrderKeyWord === item.EventName) {
                    // Log.info("已经加入的未知单信息：ID:" + selectData.EvendID + ",Name:" + selectData.FullEventName);
                    if (warningItem.EvendID === item.EvendID) {
                        if (item.ProcessFlag === 'Y') {
                            makeLog('编号为；' + warningItem.EvendID + ' 的未知单已经被修复，将当前未修复的条目舍弃');
                            skipCurrentUnknowItem = true;
                        }
                    }
                }
            }
        }
        if (skipCurrentUnknowItem) {
            continue;
        }
        originWarningList.push(warningItem);
    }
    makeLog('原始数据处理完毕，条数：' + originWarningList.length);
    ipcRenderer.send('warningListReady');

    // 延时2秒以后再处理下次请求，防止频繁的更新告警事件
    setTimeout(function () {
        handleWarngingBusy = false;
        if (loseWarningItem) {
            loseWarningItem = false;
            // 休眠期间错过了某个告警
            makeLog('错过了某些告警，补录');
            onWarningChanged();
        }
    }, Timer);
}


/**
 * 告警刷新
 */
function onWarningChanged(event, msg) {
    if (handleWarngingBusy) {
        loseWarningItem = true;
        return;
    }
    if (msg !== undefined) {
        makeLog('有新的告警事件发生');
    }
    makeLog('查询数据库获取原始告警信息');
    getWarningItemFromDb((docs) => {
        handleWarningData(docs);
    });
}

/**
 * 从内存数据库拿原始数据
 */
function getWarningItemFromDb(callback) {
    console.log('从数据库读取告警数据');
    http.get({
        port: 3721,
        path: '/warning'
    }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            body += chunk;
        });
        res.on('end', () => {
            let data = JSON.parse(body);
            callback(data);
        });
    });
}

/**
 * 同一进程只初始化一次
 */
function initSelf() {
    makeLog('初始化告警管理器');
    onWarningChanged();
    ipcRenderer.on('warningChange', onWarningChanged);
    makeLog('告警管理器初始化完毕');
}

initSelf();

export {updateSleepStatus, getWarningWithParam};