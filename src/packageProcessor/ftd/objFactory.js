/**
 * 生成报文对象
 */
const clone = require('clone');
const fs = require('fs');
const path = require('path');
const JSPath = require('jspath');
const ftdFactory = require('./ftdFactory.js');

const jsonPath = path.resolve(__dirname, '..', 'xmlconvert');
/**
 * 创建一个发送的报文
 * @param  {[type]} packageName [description]
 * @return {[type]}             [description]
 */
var createPackage = function(tid, fid) {
        var packInfo = findField(tid, fid);
        return packInfo;
    }
    /**
     * 根据packageName分析出包里面的字段
     *
     * @param  {[string]} packageName [包名]
     * @return {[JSON]}   package     [包含字段信息的包详细]
     */
var findField = function(tid, fid) {
    var extend = require('extend');
    var FTD_JSON = fs.readFileSync(jsonPath + '/FTDMisc.json');
    var ftdMiscJson = JSON.parse(FTD_JSON);
    //XML中定义的packageName不存在同名,在匹配时也可以使用tid
    var package = JSPath.apply('.FTD.packages.package{.tid==="' + tid + '"}', ftdMiscJson);
    var packagesFields = JSPath.apply('.FTD.packages.package{.tid==="' + tid + '"}.field', ftdMiscJson);
    var fieldsArray = new Array();
    //package已经包涵了所有字段的信息，需要做的就是fields属性的填充
    //如果参数中包涵fid，证明此处是直接生成一个package,通常有fid，表示根据fid直接创建，所有
    for (var i = 0; i < packagesFields.length; i++) {
        var fieldName = packagesFields[i].name;
        var partterString = '';
        if (fid) {
            partterString = '.FTD.fields.fieldDefine{.fid==="' + fid + '"}'
        } else {
            partterString = '.FTD.fields.fieldDefine{.name==="' + fieldName + '"}';
        }
        //是用UFEntity和UFDataType填充Fields
        var fields = JSPath.apply(partterString, ftdMiscJson);
        if (fields.length > 0) {
            //fid不能在package中表示了，因为fid对应的是某个field而package对应的是整个包
            // package[0].fid = fields[0].fid;
            var items = JSPath.apply('.item', fields[0]);
            if (items.length > 0) {
                //如果有item属性 则无需去Entity中查询字段,只需要直接在DataType中查询即可
            } else {
                fields[0].define = findEntity(fields[0].ref);
            }
        }
        extend(packagesFields[i], fields[0]);
    }
    // extend(package[0].fields,fieldsArray);
    // package[0].fields = fieldsArray;
    return package;

}


var findEntity = function(entityName) {
    //2017年3月13日更新，字段的顺序必须严格按照xml的顺序来解释
    //2016年02月22日更新,有些字段会存在既有fields又有ref的情况,所以此处需要同事判断2种情况
    //读取ref的内容
    // var refFieldObject=new Object();
    var refFields = new Array();
    // refFieldObject.array=refFieldObject;

    var UFENTITY_JSON = fs.readFileSync(jsonPath + '/UFEntity.json');
    var ref = JSPath.apply('.UFEntityModel.Entity{.name==="' + entityName + '"}.Ref', JSON.parse(UFENTITY_JSON));

    //一个entity的ref可能会多次关联
    var degreeRef = function(refName) {
        var refs = JSPath.apply('.UFEntityModel.Entity{.name==="' + refName + '"}.Ref', JSON.parse(UFENTITY_JSON));
        //查询是否有raf
        if (refs.length > 0) {
            for (var i = 0; i < refs.length; i++) {
                degreeRef(refs[i].entity);
            }
        } else {
            var fields = JSPath.apply('.UFEntityModel.Entity{.name==="' + refName + '"}.Field', JSON.parse(UFENTITY_JSON));
            refFields = refFields.concat(fields);
        }
    }
    if (ref.length > 0) {
        //有些字段会有多个ref所以此处要多次处理
        for (var i = 0; i < ref.length; i++) {
            var refEntityName = ref[i].entity;
            degreeRef(refEntityName);
            // refFields = refFields.concat(JSPath.apply('.UFEntityModel.Entity{.name==="' + refEntityName + '"}.Field', JSON.parse(UFENTITY_JSON)));
        }
    }

    var fields = JSPath.apply('.UFEntityModel.Entity{.name==="' + entityName + '"}.Field', JSON.parse(UFENTITY_JSON));
    var fieldArray = new Array();
    for (var i = 0; i < refFields.length; i++) {
        var field = findDataType(refFields[i].type);
        field.name = refFields[i].name;
        field.label = refFields[i].label;
        fieldArray.push(field);
    }

    for (var i = 0; i < fields.length; i++) {
        var field = findDataType(fields[i].type);
        field.name = fields[i].name;
        field.label = fields[i].label;
        fieldArray.push(field);
    }
    return fieldArray;
}



var findDataType = function(typeName) {
    var UFDATATYPE_JSON = fs.readFileSync(jsonPath + '/UFDataType.json');
    var dataTypeJSON = JSON.parse(UFDATATYPE_JSON);
    var intTypes = JSPath.apply('.UFDataTypes.Int{.typename==="' + typeName + '"}', dataTypeJSON);
    var stringTypes = JSPath.apply('.UFDataTypes.String{.typename==="' + typeName + '"}', dataTypeJSON);
    var vstringTypes = JSPath.apply('.UFDataTypes.VString{.typename==="' + typeName + '"}', dataTypeJSON);
    var floatTypes = JSPath.apply('.UFDataTypes.Float{.typename==="' + typeName + '"}', dataTypeJSON);
    var rangeIntTypes = JSPath.apply('.UFDataTypes.RangeInt{.typename==="' + typeName + '"}', dataTypeJSON);
    var fixNumberTypes = JSPath.apply('.UFDataTypes.FixNumber{.typename==="' + typeName + '"}', dataTypeJSON);
    var enumTypes = JSPath.apply('.UFDataTypes.EnumChar{.typename==="' + typeName + '"}', dataTypeJSON);
    var arrayTypes = JSPath.apply('.UFDataTypes.Array{.typename==="' + typeName + '"}', dataTypeJSON);
    var qWordTypes = JSPath.apply('.UFDataTypes.QWord{.typename==="' + typeName + '"}', dataTypeJSON);
    var wordTypes = JSPath.apply('.UFDataTypes.Word{.typename==="' + typeName + '"}', dataTypeJSON);
    var charTypes = JSPath.apply('.UFDataTypes.Char{.typename==="' + typeName + '"}', dataTypeJSON);
    //xml中有一种枚举类型,此处暂时不处理,某种意义上,改类型就是一个长度为1的char类型
    //一个字段只会有一个数据类型,所以可以直接取第一个元素
    if (intTypes.length > 0) {
        intTypes[0].datatype = 'int';
        return intTypes[0];
    } else if (stringTypes.length > 0) {
        stringTypes[0].datatype = 'string';
        return stringTypes[0];
    } else if (vstringTypes.length > 0) {
        vstringTypes[0].datatype = 'vstring';
        return vstringTypes[0];
    } else if (floatTypes.length > 0) {
        floatTypes[0].datatype = 'float';
        return floatTypes[0];
    } else if (rangeIntTypes.length > 0) {
        rangeIntTypes[0].datatype = 'rangeInt';
        return rangeIntTypes[0];
    } else if (fixNumberTypes.length > 0) {
        fixNumberTypes[0].datatype = 'fixNumber';
        return fixNumberTypes[0];
    } else if (enumTypes.length > 0) {
        enumTypes[0].datatype = 'char';
        return enumTypes[0];
    } else if (arrayTypes.length > 0) {
        arrayTypes[0].datatype = 'array';
        return arrayTypes[0];
    } else if (qWordTypes.length > 0) {
        qWordTypes[0].datatype = 'long';
        return qWordTypes[0];
    } else if (wordTypes.length > 0) {
        wordTypes[0].datatype = 'long';
        return wordTypes[0];
    } else if (charTypes.length > 0) {
        charTypes[0].datatype = 'char';
        return charTypes[0];
    }
}



exports.createPackage = createPackage;
