const ftdFactory = require('./ftdFactory');
const clone = require('clone');
/**
 * 用来解析读取BUffer的对象
 * @type {Object}
 */
var receiverBuffer = new Buffer(0);
var readIndex = 0;
var flag = 0;
var chainPackage = {};
var timer;
var to = 0;
var count = 0;
var ftdReader = {
    /**
     * 启动分析逻辑 每当有可被解析的Stream被拆解，通知主线程去解析
     * @param  {[type]} ){                 })( [description]
     * @return {[type]}     [description]
     */
    // runAnaProcess:(function(){
    //     anaprocess.send('start');
    //     anaprocess.on('message',function(msg){

    //     });
    // })(),
    /**将所有的报文都保存在一个数组中,方便读取操作
     * [writeBufferInPool description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    writeBufferInPool: function(requestID, data) {
        ftdReader.saveBufferToFile(data);
    },
    /**
     * 将报文写到文件中
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    saveBufferToFile: function(data) {
        receiverBuffer = Buffer.concat([receiverBuffer, data]);
        //通知解析程序解析
        ftdReader.analysisBuffer();
    },
    analysisBuffer: function() {
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
            let tid = newBuffer.slice(10, 14).toString('hex');
            ftdReader.setChainPackage(tid, newBuffer);

            //以上代码可能会去掉，待测试
            if (chain == 'L') {
                var SendAPI = require('../local/sendapi.js');
                SendAPI.steamToSend(ftdReader.getChainPackage(tid));
                ftdReader.cleanChainPackage(tid);
            }

            if (receiverBuffer.length > readIndex) {
                analysisBuffer();
            } else if (receiverBuffer.length == readIndex) {
                var bufferLengthKB = receiverBuffer.length / 128;
                if (bufferLengthKB > 100) {
                    receiverBuffer = new Buffer(0);
                    readIndex = 0;
                }
            }
        }
    },
    setChainPackage: function(tid, buffer) {
        if (chainPackage[tid] == null) {
            chainPackage[tid] = [];
        }
        chainPackage[tid].push(buffer);
    },
    cleanChainPackage: function(tid) {
        if (chainPackage[tid]) {
            chainPackage[tid] = [];
        }
    },
    getChainPackage: function(tid) {
        return chainPackage[tid];
    },
    steamToObject: function(buffer) {
        var newBuffer = ftdFactory.unCompressed(buffer);
    }
}

/**
 * 判断3分钟内是否还有收到数据
 * @return {Boolean} [description]
 */
var timer;

function isReceiver(fun) {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(function() { fun(); }, 1 * 6000);
}

module.exports = ftdReader;
