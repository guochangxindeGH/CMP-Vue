const ftdFactory = require('./ftdFactory');
const clone = require('clone');
/**
 * ����������ȡBUffer�Ķ���
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
     * ���������߼� ÿ���пɱ�������Stream����⣬֪ͨ���߳�ȥ����
     * @param  {[type]} ){                 })( [description]
     * @return {[type]}     [description]
     */
    // runAnaProcess:(function(){
    //     anaprocess.send('start');
    //     anaprocess.on('message',function(msg){

    //     });
    // })(),
    /**�����еı��Ķ�������һ��������,�����ȡ����
     * [writeBufferInPool description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    writeBufferInPool: function(requestID, data) {
        ftdReader.saveBufferToFile(data);
    },
    /**
     * ������д���ļ���
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    saveBufferToFile: function(data) {
        receiverBuffer = Buffer.concat([receiverBuffer, data]);
        //֪ͨ�����������
        ftdReader.analysisBuffer();
    },
    analysisBuffer: function() {
        if (receiverBuffer && receiverBuffer.length > 3) {
            let totalBuffer;
            //��� CRP �����ù�ѹ���㷨,��ѹ����� FTDC ��ĳ��ȼ��㷽��Ϊ XMP ��ĳ����ֶ� (xmp.Length)��ȥ CRP ��ĳ��ȡ�
            if (readIndex > 0) {
                totalBuffer = receiverBuffer.slice(readIndex);
            } else {
                totalBuffer = receiverBuffer;
            }

            if (totalBuffer.length < 4) {
                return;
            }
            let length = totalBuffer.readInt16BE(2) + 4;
            //�ҵ�һ�������ı���,������ͷ������,�����ǰ����ʵ�ʳ��Ȳ����㱨�ĳ���,�ȴ���һ�����ݴ���,Ҳ���ǽ�����һ�α���
            if (totalBuffer.length < length) {
                // console.warn('����Ӧ��' + length + ',ʣ�౨�ĳ�' + totalBuffer.length);
                return;
            }
            //�����ǰ���ĳ������㱨��Ӧ�г���,ȡ�������еĵ�һ��,��ѹ��,����������������������,�����½��ձ��ĳ��еı���
            let currentBuffer = totalBuffer.slice(0, length);
            readIndex += length;

            let newBuffer = ftdFactory.unCompressed(currentBuffer);
            //ֱ�ӽ���ѹ��֮������ݴ��ݽ�ȥ����������

            //������ĺ���չ��ͷ����chain�Ͳ��ǵ�7��
            let extLength = newBuffer.readIntBE(1, 1);
            let chain;
            if (extLength == 0) {
                //�����������Ķ�����ֽڣ����Լ���3���ֽڣ���ͬ�޸���ftdFactory.js��Ҳ��
                chain = newBuffer.toString('ascii', 7, 8);
            } else {
                chain = newBuffer.toString('ascii', 4 + extLength, 5 + extLength);
            }
            let tid = newBuffer.slice(10, 14).toString('hex');
            ftdReader.setChainPackage(tid, newBuffer);

            //���ϴ�����ܻ�ȥ����������
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
 * �ж�3�������Ƿ����յ�����
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
