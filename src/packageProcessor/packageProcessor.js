'use strict';
const {
    ipcRenderer
} = require('electron');
const path = require('path');
const http = require('http');
const address = require('../../config/address');
const ftdFactory = require('./ftd/ftdFactory');
const net = require('net');
const PACKAGES = require('./xmlconvert/packages');
const info = require('./xmlconvert/info.json');
const querystring = require('querystring');
const Utils = path.join(__dirname, '../util/Utils');
const crypto = require('crypto');

let taskHeartBeat;

function SendReceiverProcess() {
    let _connect_times = 0;
    console.log('连接服务器初始化开始--->');


    let receivers = [];
    let receiverBuffer = new Buffer(0);
    let readIndex = 0;
    let chainPackage = {};


    let setChainPackage = function (tid, buffer) {
        if (chainPackage[tid] == null) {
            chainPackage[tid] = [];
        }
        chainPackage[tid].push(buffer);
    };

    let cleanChainPackage = function (tid) {
        if (chainPackage[tid]) {
            chainPackage[tid] = [];
        }
    };

    let getChainPackage = function (tid) {
        return chainPackage[tid];
    };

    //休眠状态，禁止发送通知
    let warningSleepTime = false;
    //休眠期间发生了告警事件，需要在休眠结束之后补发通知
    let haveUnhandleEvent = false;
    let skipTid = '';
    let skipPackageName = '';
    /**
     * 缓存数据
     * @param  {[type]} datas [description]
     * @return {[type]}       [description]
     */
    let saveDataIntoLocalStorage = function (tid, datas) {
        //暂时不保存这个
        if (tid != '001001c1') {
            let arrayDatas = [];
            for (let i = 0; i < datas.length; i++) {
                let data = datas[i];
                let packName = info[tid];
                let packInfo = ftdFactory.assembleReceiverPackage(data, PACKAGES[packName].call());
                if (packName === 'RtnWarningEventTopic' || packName === 'RtnOrderDelayInfo') {
                    let body = {
                        content: JSON.stringify(packInfo)
                    };

                    let bodyMsg = querystring.stringify(body);
                    let req = http.request({
                        port: 3721,
                        path: '/save',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': bodyMsg.length
                        }
                    }, (res) => {
                        if (i === datas.length - 1) {
                            if (res.statusCode === 200) {
                                if (warningSleepTime === true) {
                                    //休眠期间，不发送通知
                                    console.log('休眠期间，跳过告警广播');
                                    haveUnhandleEvent = true;
                                    skipTid = tid;
                                    skipPackageName = packName;
                                    return;
                                }
                                warningSleepTime = true;
                                haveUnhandleEvent = false;
                                setTimeout(function () {
                                    //定时器到之后，查询在定时器期间是否错过了某个告警，如果错过了，补发通知
                                    warningSleepTime = false;
                                    if (haveUnhandleEvent) {
                                        console.log('休眠结束，曾经跳过了告警，现在补发');
                                        sendBoardcast(skipTid, skipPackageName);
                                    }
                                }, 1000);
                                sendBoardcast(tid, packName);
                            }
                        }
                    });
                    req.write(bodyMsg);
                    req.end();
                } else if (packName === 'RtnTradingDay') {
                    let TradingDay = packInfo.field.values[0].TradingDay;
                    localStorage.setItem('loginInfo'.TradingDay, TradingDay);
                } else {
                    arrayDatas.push(packInfo);
                    if (i + 1 === datas.length) {
                        boradCastReceiver({
                            tid: tid,
                            packName: packName,
                            packInfo: JSON.stringify(arrayDatas)
                        });
                    }
                }
            }
        }
    };

    let sendBoardcast = function (tid, packName) {
        console.log('发送告警广播');
        ipcRenderer.send('warningChange', {
            tid: tid,
            packName: packName
        });

        boradCastReceiver({
            tid: tid,
            packName: packName
        });
    };
    /**
     * 发送广播
     * @return {[type]} [description]
     */
    let boradCastReceiver = function (msg) {
        //首先将解析完整的数据保存在localStorage中，然后通知另外一个进程去更新
        ipcRenderer.send('dataChange', msg);
        // ipcRenderer.send(msg.packName, msg);
    };

    /**
     * 分析报文
     * @return {[type]} [description]
     */
    let analysisBuffer = function () {
        if (receiverBuffer && receiverBuffer.length > 3) {
            let totalBuffer;
            //如果 CRP 层设置过压缩算法,则压缩后的 FTDC 层的长度计算方法为 XMP 层的长度字段 (xmp.Length)减去 CRP 层的长度。
            if (readIndex > 0) {
                totalBuffer = receiverBuffer.slice(readIndex);
            } else {
                totalBuffer = receiverBuffer;
            }

            if (totalBuffer.length < 4) {
                return;
            }
            let length = totalBuffer.readInt16BE(2) + 4;
            //找到一份完整的报文,包含报头和正文,如果当前报文实际长度不满足报文长度,等待下一次数据传递,也就是接收下一次报文
            if (totalBuffer.length < length) {
                // console.warn('报文应长' + length + ',剩余报文长' + totalBuffer.length);
                return;
            }
            //如果当前报文长度满足报文应有长度,取出报文中的第一段,解压缩,并放置在完整报文数组中,并更新接收报文池中的报文
            let currentBuffer = totalBuffer.slice(0, length);
            readIndex += length;

            let newBuffer = ftdFactory.unCompressed(currentBuffer);
            //直接将解压缩之后的数据传递进去，用来解析

            //如果报文含拓展报头，则chain就不是第7个
            let extLength = newBuffer.readIntBE(1, 1);
            let chain;
            if (extLength == 0) {
                //换服务器后报文多出了字节，所以加了3个字节，相同修改再ftdFactory.js中也有
                chain = newBuffer.toString('ascii', 7, 8);
            } else {
                chain = newBuffer.toString('ascii', 4 + extLength, 5 + extLength);
            }
            var tid = newBuffer.slice(10, 14).toString('hex');
            setChainPackage(tid, newBuffer);
            //以上代码可能会去掉，待测试
            if (chain == 'L') {
                saveDataIntoLocalStorage(tid, getChainPackage(tid));
                cleanChainPackage(tid);
            }

            if (receiverBuffer.length > readIndex) {
                analysisBuffer();
            } else if (receiverBuffer.length == readIndex) {
                let bufferLengthKB = receiverBuffer.length / 128;
                if (bufferLengthKB > 100) {
                    receiverBuffer = new Buffer(0);
                    readIndex = 0;
                }
            }
        }
    };


    let conn = net.createConnection({
        port: address.getLoginPort(),
        host: address.getLoginAddress()
    });

    conn.setTimeout(5000);
    conn.on('connect', () => {
        let now = new Date();
        console.log('[connect]' + now.toLocaleTimeString());
        ipcRenderer.send('CONNECTED', true);
    });

    conn.on('data', function (data) {
        if (data.length == 6) {
            console.log('接收到心跳包');
        } else {
            //暂时还是在同一个进程，阻塞式的读写文件，每次受到数据都做一次写的操作，然后做一次读的操作
            receiverBuffer = Buffer.concat([receiverBuffer, data]);
            analysisBuffer();
        }
    });

    conn.on('timeout', () => {
        let now = new Date();
        console.log('[timeout]' + now.toLocaleTimeString());
    });
    conn.on('close', () => {
        let now = new Date();
        console.log('[close]' + now.toLocaleTimeString());
        ipcRenderer.send('CONNECTION_CLOSE', false);
    });
    conn.on('error', () => {
        let now = new Date();
        console.log('[error]' + now.toLocaleTimeString());
        conn.connect({
            port: address.getLoginPort(),
            host: address.getLoginAddress()
        });
        //发个报文试试
        let userName = localStorage.getItem('username');
        let password = localStorage.getItem('password');
        let version = localStorage.getItem('version');
        //TODO 停掉requestID获取
        let requestID = Utils.getNewRequestID();
        if (password !== '') {
            // console.log('发送登陆报文探测');
            ipcRenderer.send('sendPackStepA', {
                packName: 'ReqUserLoginTopic',
                opts: {
                    TradingDay: '',
                    UserID: userName,
                    ParticipantID: '',
                    Password: crypto.createHash('md5').update(password).digest('hex').toUpperCase(),
                    UserProductInfo: '',
                    InterfaceProductInfo: '',
                    ProtocolInfo: version,
                    DataCenterID: ''
                },
                requestID: requestID
            });
        } else {
            // console.log('用户已经注销，无需自动发送登陆报文');
        }
        //登录报文
        now = new Date();
        console.log('[reConnect]' + now.toLocaleTimeString());
    });

    setInterval(() => {
        var buffer = Buffer.from([0x00, 0x02, 0x00, 0x00, 0x05, 0x00]);
        conn.write(buffer);
    }, 1000);


    let srprocess = {
        connect_times: 0,
        /**
         * 发送报文
         * @return {[type]} [description]
         */
        sendPackage: function (data) {
            let buff = ftdFactory.assembleSendPackage(data.packInfo, data.opts, data.requestID);
            conn.write(buff);
        },

        close: () => {
            conn.end();
            conn.removeAllListeners();
        }
    };
    console.log('连接服务器初始化结束<---');
    return srprocess;
}


function init() {
    let srp = new SendReceiverProcess();

    ipcRenderer.on('sendPackage', (event, message) => {
        //参数包含包类型和参数
        //组包，发报文
        srp.sendPackage({
            packInfo: PACKAGES[message.packName].call(),
            opts: message.opts,
            requestID: message.requestID
        });
    });

    ipcRenderer.on('setupAddress', (event, message) => {
        // clearTimeout(taskHeartBeat);
        address.server = message.server;
        srp.close();
        // 这里无需重连，当链接被close()时，链接内注册的on close事件会自动触发restartSocket，继而重连。
        // srp = new SendReceiverProcess();
    });
}

init();
