'use strict';
const clone = require('clone');
const iconv = require('iconv-lite');
/**
 * 组装用来发送的FTD报文
 */
//在不修改的情况下,报文除正文外,长度为30

var ftdFactory = {
    startIndex: 30,
    /**
     * 次方法返回一个根据包定义生成的BUFFER,并填充其中的一些属性
     * @param  {[type]} packInfo [description]
     * @return {[type]}          [description]
     */
    assembleSendPackage: function(packInfo, option, requestID) {
        //首先循环field获取报文内容的长度
        var fieldGroup = packInfo[0].field;
        var contentLength = 0;
        const maxSignedInt16 = parseInt(0x8000);

        var toSteam = function(field) {
            if (field.minOccur == 1) {
                for (var j = 0; j < field.define.length; j++) {
                    var fieldDefine = field.define[j];
                    var tempAdd = 0;
                    if (fieldDefine.datatype === 'string' || fieldDefine.datatype == 'vstring') {
                        tempAdd = 1;
                    } else if (fieldDefine.datatype === 'char') {
                        fieldDefine.length = '1';
                    }
                    var temLen = new Number(fieldDefine.length);
                    contentLength += temLen + tempAdd;
                }
            }
        }

        if (Array.isArray(fieldGroup)) {
            for (var i = 0; i < fieldGroup.length; i++) {
                var field = fieldGroup[i];
                toSteam(field);
            }
        } else {
            toSteam(fieldGroup);
        }
        var bufferlength = 30 + contentLength;
        var buff = new Buffer(bufferlength);
        buff.fill(0);
        buff[0] = 0x02; //FtdTypeCompressed

        buff[1] = 0x00; //FtdExLen
        var ftdContentLen = bufferlength - 4;

        buff.writeInt16BE(ftdContentLen, 2);
        buff[4] = 0x01; //CRPType
        buff[5] = 0x00; //CRPMethod 00表示不压缩

        buff[6] = 0x04; //Version

        buff[7] = 0x4c; //Chain

        buff[8] = 0x00; //SequenceSeries uint16
        buff[9] = 0x00;
        var tid = parseInt(packInfo[0].tid);
        buff.writeInt32BE(tid, 10); //10 11 12 13 Tid
        //14 15 16 17 SequenceNumber 暂时没有用到,所以是0,没有特别去设置
        buff.writeInt16BE(1, 18); //18 19 FieldCount 默认为1,以后可能会出现有多个FieldCount的发送包
        buff.writeInt16BE(contentLength + 4, 20); //20 21 ContentLength加上报头
        //22 23 24 25 RequestId 不用填充,将会在报文发送模块中去写,默认为0
        buff.writeInt32BE(requestID, 22);
        var fields = packInfo[0].field;
        //logUtils.logToFile(fields, true);
        // var fid = parseInt(packInfo.fid);
        if (Array.isArray(fields)) {
            if ((fields[0].fid & 0x8000) === maxSignedInt16) {
                buff.writeUInt16BE(fields[0].fid, 26); //26 27 fid
            } else {
                buff.writeInt16BE(fields[0].fid, 26); //26 27 fid
            }
            buff.writeInt16BE(contentLength, 28); //28 29 contentLength
            buff = ftdFactory.writeDataByOption(buff, packInfo, option);
        } else {
            if ((fields.fid & 0x8000) === maxSignedInt16) {
                buff.writeUInt16BE(fields.fid, 26); //26 27 fid
            } else {
                buff.writeInt16BE(fields.fid, 26); //26 27 fid
            }
            buff.writeInt16BE(contentLength, 28); //28 29 contentLength
            buff = ftdFactory.writeDataByOption(buff, packInfo, option);
        }
        // buff.writeInt16BE(fid, 26); //26 27 fid
        return buff;
    },

    /**
     * 将接收到的buffer报文转换为json对象
     * @param  {[type]} buffer [description]
     * @return {[type]}        [description]
     */
    findTidFid: function(buffer) {
        //首先判断当前报文是否为压缩报文
        // var newbuffer = ftdFactory.unCompressed(buffer);
        var tid = toHexString(buffer.slice(10, 14), 8);
        //此处取到的fid实际为第一个数据域的fid.如果以后出现一个package中包含多种数据的情况,这里需要修改逻辑
        var fid = toHexString(buffer.slice(26, 28), 4);

        return {
            tid: tid,
            fid: fid,
            buffer: buffer
        };
    },
    /**
     * 解析收到的数据包
     * @param  {[type]} buffer   [此处的buffer为解压缩的buffer]
     * @param  {[type]} packInfo [description]
     * @return {[type]}          [description]
     */
    assembleReceiverPackage: function(buffer, packInfos) {
        let packInfo = packInfos[0];
        this.startIndex = 30;
        let fieldCount = buffer.readInt16BE(18);
        packInfo.requestID = buffer.readInt32BE(22);

        //用循环处理每一个field
        //这一段报文包括每一个field的ftd和Length
        // buffer = buffer.slice(30);
        buffer = buffer.slice(26);

        let getValue = function(buffer, type) {
            if (buffer.length > 0) {
                if (type === 'string' || type === 'vstring') {
                    let temp = new Array();
                    for (let i = 0; i < buffer.length; i++) {
                        if (buffer[i] != 0) {
                            temp.push(buffer[i]);
                        } else {
                            break;
                        }
                    }
                    let newBuffer = new Buffer(temp);
                    let stringValue = iconv.decode(newBuffer, 'gbk').toString();
                    return stringValue;
                } else if (type === 'int') {
                    return buffer.readInt32BE(0);
                } else if (type === 'float') {
                    return buffer.readFloatBE(0);
                } else if (type === 'rangeInt') {
                    return buffer.readInt32BE(0);
                } else if (type === 'fixNumber') {
                    return buffer.readFloatBE(0);
                } else if (type === 'char') {
                    return buffer.toString();
                } else if (type === 'array') {
                    return buffer.toString();
                } else if (type === 'double') {
                    return buffer.readDoubleBE(0);
                }
            } else {
                //TODO 去掉这个大量的Log
                // console.warn('被解析报文长度为0');
                return 0;
            }
        };
        //根据define创建一个Values 对象
        let makeValues = function(define, fid) {
            let values = {};
            for (let i = 0; i < define.length; i++) {
                let attr = define[i];
                let length = parseInt(attr.length);
                let type = attr.datatype;
                if (type === 'string' || type === 'vstring') {
                    length += 1;
                } else if (type === 'int' || type === 'float' || type === 'long'||type==='rangeInt') {
                    length = 4;
                } else if (type === 'double' || type === 'fixNumber') {
                    length = 8;
                } else if (type === 'char') {
                    length = 1;
                } else if (type === 'array') {
                    length += 1;
                }
                //下载文件中犹豫报文会将文件的信息流作为字符串传递，所以要特殊判断
                if (fid === '0x5459' && attr.name === 'Comment') {
                    let attrLength = new Number(attr.length);
                    values[attr.name] = buffer.slice(0, attrLength);
                } else {
                    values[attr.name] = getValue(buffer.slice(0, length), type);
                }
                // debugger;
                buffer = buffer.slice(length);
            }
            return values;
        };
        //给field添加一个数组，方便获取值
        let addArray = function() {
            if (Array.isArray(packInfo.field)) {
                for (let i = 0; i < packInfo.field.length; i++) {
                    packInfo.field[i].values = [];
                }
            } else {
                packInfo.field.values = [];
            }
        }
        // let a = new Array();
        addArray();
        //开始解析报文，从第一个field开始，不在使用fieldCount属性，而是从开始一直往下读报文并赋值
        while (buffer.length > 0) {

            // let fid = toHexString(buffer.slice(0, 2), 4);
            //此处直接截取后toString()
            let fid = ('0x' + buffer.slice(0, 2).toString('hex')).toUpperCase();
            // if(fid==='0X9135'){
            //     debugger;
            // }
            //如果 field 字段是数组，则循环
            let fields = packInfo.field;
            //此处会出现一个包多个数据的情况

            buffer = buffer.slice(4);
            if (Array.isArray(fields)) {
                for (let i = 0; i < fields.length; i++) {
                    let field = fields[i];
                    let ffid = field.fid.toUpperCase();
                    if (ffid == fid) {
                        let values = makeValues(field.define, field.fid);
                        let arr = field.values;
                        arr.push(values);
                    }
                }
            } else {
                let field = fields;
                let ffid = field.fid.toUpperCase();
                if (ffid == fid) {
                    let values = makeValues(field.define);
                    let arr = field.values;
                    arr.push(values);
                }
            }
        }
        return packInfo;
    },
    /**
     * 解压缩流
     * @param  {[type]} buffer [description]
     * @return {[type]}        [description]
     */
    unCompressed: function(buffer) {
        //头不需要压缩
        //头本身有4个字节，信息正文有一个头是16个字节，计算
        var isCompressed = buffer[5] == 0x03;
        if (isCompressed) {
            var i = 0;
            var tempArray = new Array();
            var tempMin = 0xe0;
            var tempMax = 0xf0;
            var escapeByte = 0xe0; //压缩算法转义字节

            while (i < buffer.length) {
                if (i < 4) {
                    tempArray.push(buffer[i++]);
                    continue;
                }
                var currentByte = buffer[i];
                //表示是一个压缩
                if (currentByte == escapeByte) {
                    tempArray.push(buffer[i + 1]);
                    i += 2;
                    continue;
                }
                if (currentByte > tempMin && currentByte < tempMax) {
                    var compressCount = currentByte & 0x0f;
                    for (var j = 0; j < compressCount; j++) {
                        tempArray.push(0x00);
                    }
                    i++;
                    continue;
                }
                tempArray.push(buffer[i++]);
            }
            buffer = new Buffer(tempArray);
        } else if (buffer[5] === 0x00) {
            buffer = buffer;
        } else {
            console.warn('报文并未采取0压缩算法，无法用现有方法解压缩');
        }
        return buffer;
    },
    /**
     * 通过匹配json中对field的定义,将报文正文写到buffer中
     * @param  {[Buffer]}     buffer   [报文流]
     * @param  {[JSONObject]} packInfo [格式json]
     * @param  {[JSONObject]} option   [正文json,正文的key必须和UFEntity.json的内容保持一致]
     * @return {[type]}          [description]
     */
    writeDataByOption: function(buffer, packInfo, option) {
        var jsonfields = packInfo[0].field;
        if (!Array.isArray(jsonfields)) {
            jsonfields = [jsonfields];
        }
        //如果是第一个字段,偏移量从第30位开始,如果不是第一个字段,则为上个字段的偏移量加上本身字段的长度
        var offset = 30;
        //字段可能有多个
        for (var i = 0; i < jsonfields.length; i++) {
            //2016-5-18 此处只处理发生次数大于1的

            var field = jsonfields[i];
            if (field.minOccur == 1) {
                for (var j = 0; j < field.define.length; j++) {
                    var fieldDefine = field.define[j];
                    var fieldLength = ftdFactory.getFieldLength(fieldDefine);

                    //匹配格式JSON中的字段和正文参数JSON
                    for (var key in fieldDefine) {
                        if (key == 'name') {
                            var name = fieldDefine[key];
                            //如果packInfo的名字和正文定义的名字相同,则写到buffer中
                            for (var optionKey in option) {
                                if (name == optionKey) {
                                    //根据字段的类型来写不同的类型
                                    var type = fieldDefine.datatype;
                                    if (type === 'string' || type === 'vstring') {
                                        if (buffer.length > offset) {
                                            //服务器在处理中文时会使用gbk，写入string时考虑转换编码
                                            // var bufferGBK=iconv.encode(option[optionKey],'gbk');
                                            // buffer.write(bufferGBK.toString(), offset);
                                            // debugger;
                                            // buffer.write(option[optionKey],offset);
                                            var tar = iconv.encode(option[optionKey], 'gbk');
                                            tar.copy(buffer, offset);
                                        }
                                    } else if (type === 'int') {
                                        if (option[optionKey]) {
                                            if (buffer.length > offset) {
                                                buffer.writeInt32BE(option[optionKey], offset);
                                            }
                                        }
                                    } else if (type === 'char') {
                                        if(buffer.length>offset){
                                            buffer.write(option[optionKey],offset);
                                        }
                                    }else if (type === 'double') {
                                        if(buffer.length>offset){
                                            buffer.writeDoubleBE(option[optionKey],offset);
                                        }
                                    }
                                    else {
                                        console.log('datatype is not supported,field is ' + optionKey);
                                    }
                                }
                            }
                        }
                    }
                    offset += fieldLength;
                }
            }

        }
        return buffer;
    },
    getFieldLength: function(field) {
        var length = parseInt(field.length);
        var type = field.datatype;
        if (type === 'string' || type === 'vstring') {
            length += 1;
        } else if (type === 'int' || type === 'float' || type === 'long') {
            length = 4;
        } else if (type === 'double') {
            length = 8;
        }
        return length;
    }

}

var setFieldValue = function(buffer, field, type) {
    if (buffer.length > 0) {
        if (type === 'string' || type === 'vstring') {
            var temp = new Array();
            for (var i = 0; i < buffer.length; i++) {
                if (buffer[i] != 0) {
                    temp.push(buffer[i]);
                } else {
                    break;
                }
            }
            var newBuffer = new Buffer(temp);
            var stringValue = iconv.decode(newBuffer, 'gbk');
            field.value = stringValue.toString();
        } else if (type === 'int') {
            field.value = buffer.readInt32BE(0);
        } else if (type === 'float') {
            field.value = buffer.readFloat32BE(0);
        } else if (type === 'rangeInt') {
            field.value = buffer.readInt32BE(0);
        } else if (type === 'fixNumber') {
            field.value = buffer.readFloatBE(0);
        }
    } else {
        //console.error('buffer 没有实际的值,field为'+field+',type为'+type);
    }
}

/**
 * 将buffer对象转换成为hexString
 * @param  {Buffer} tid 需要转换的字节对象
 * @param  {int}  length 字节总长度
 * @return {[type]}     [description]
 */
var toHexString = function(source, length) {
    if (source && source.length > 0) {
        var zeroTemp = '0x';
        if (length === 8) {
            var temp = source.readInt32BE().toString(16);
        } else if (length === 4) {
            try {
                var temp = source.readInt16BE().toString(16);
            } catch (err) {
                throw err;
            }
        }
        for (var i = 0; i < (length - temp.length); i++) {
            zeroTemp += '0';
        }
        return zeroTemp + temp.toUpperCase();
    } else {
        console.error('source 对象为null');
    }


}

/**
 * 获取报文类型
 * @param  {[Buffer]} buffer [报文全文]
 * @return {[type]}        [description]
 */
var getFtdType = function(buffer) {
    //先判断第一个字节是否为报文类型
    if (headType === 0x00) {
        //无意义,心跳
    } else if (headType === 0x01) {
        //是正常的域数据内容,表示所谓有内容无需要压缩
    } else if (headType === 0x02) {
        //压缩内容
    } else {
        //有可能是报文截断
    }
}
module.exports = ftdFactory;