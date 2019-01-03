/**
 * 将xml转换为json文件
 */

const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
const iconv = require('iconv-lite');
const JSPath = require('jspath');
const nosql = require('nosql').load(path.resolve(__dirname, '..', '..', '..', 'db') + '/view.nosql');
const objFactory = require('../ftd/objFactory.js');


var parser = new xml2js.Parser({
    mergeAttrs: true,
    explicitArray: false
});

var finishSet = new Set();
var onFinishCallback = function() {};

/**
 * 转换xml到json
 * @onFinishLisener  {function} 当文件写之后调用回调函数通知调用者 
 * @return {[type]}
 */
var convert = function(callback) {
    if (callback)
        onFinishCallback = callback;
    var xmlfilefloder = __dirname;
    fs.readFile(xmlfilefloder + '/FTDMisc.xml', function(err, data) {
        if (err) {
            throw err;
        }
        parser.parseString(iconv.decode(data, 'gbk'), function(err, result) {
            if (err) {
                throw err;
            }
            createJSON(err, result, 'FTDMisc.json');
        });
    });
    fs.readFile(xmlfilefloder + '/UFDataType.xml', function(err, data) {
        if (err) {
            throw err;
        }
        parser.parseString(iconv.decode(data, 'gbk'), function(err, result) {
            if (err) {
                throw err;
            }
            createJSON(err, result, 'UFDataType.json');
        });
    });
    fs.readFile(xmlfilefloder + '/UFEntity.xml', function(err, data) {
        if (err) {
            throw err;
        }
        parser.parseString(iconv.decode(data, 'gbk'), function(err, result) {
            if (err) {
                throw err;
            }
            createJSON(err, result, 'UFEntity.json');
        });
    });
}

/**
 * 创建json文件
 * @err  {[type]} 错误信息
 * @result  {[type]} json结果
 * @fileName {[type]} 文件名
 * @return {[type]}
 */
var createJSON = function(err, result, fileName) {
    var xmlfilefloder = __dirname;
    var content = JSON.stringify(result);
    fs.writeFileSync(xmlfilefloder + '/' + fileName, content);
    finishSet.add(fileName);
    onFinish();
}

/**
 * 判断是否3个文件都已完成xml到json的转换 如果完成,调用回调
 * @return {[type]}
 */
var onFinish = function() {
    if (finishSet.size === 3) {
        saveTids();
    }
}


var saveTids = function() {
    var jsonFloder = __dirname;
    fs.readFile(jsonFloder + '/FTDMisc.json', function(err, result) {
        if (err) {
            throw err;
        }
        var json = JSON.parse(result);
        var packages = json.FTD.packages.package;
        var tempPacks = new Array();
        var temp = {};
        for (var i = 0; i < packages.length; i++) {
            var pack = packages[i];
            temp[pack.tid] = pack.name;
            var jsonPack = objFactory.createPackage(pack.tid);
            var obj = jsonPack[0].name + ':function(){\nreturn ' + JSON.stringify(jsonPack) + ';\n}';
            tempPacks.push(obj);
            var percent = (i / packages.length * 100);
            console.log(percent.toFixed(2) + '% is finished');
        }

        let packBwriten = 'let info=' + JSON.stringify(temp) + ';\nmodule.exports=info;';
        fs.writeFile(jsonFloder + '/info-new.json', packBwriten,(err)=>{console.log(err);});
        var textBwriten = 'var package={' + tempPacks.toString() + '}\nmodule.exports=package';
        // console.log(textBwriten);
        fs.writeFile(jsonFloder + '/packages-new.js', textBwriten, (err)=>{onFinishCallback(packages)});

    });
}

exports.convert = convert;

exports.convertXML2JS = function(name, path, callback) {
    var xmlParer = new xml2js.Parser({
        mergeAttrs: true,
        explicitArray: false
    });

    fs.readFile(path, function(err, data) {
        xmlParer.parseString(iconv.decode(data, 'gbk'), function(err, json) {
            if (err) {
                throw err;
            }
            nosql.insert({
                view: name,
                content: json
            });
            callback(true);
        });
    });
}

exports.convertSystemConfig = function(callback) {
    var xmlParer = new xml2js.Parser({
        // mergeAttrs: true,
        // explicitArray: false
    });
    var configPath = path.resolve(__dirname, '..', '..', '..', 'config');
    fs.readFile(configPath + '/SystemConfig.xml', function(err, data) {
        if (data) {
            xmlParer.parseString(data, function(err, json) {
                if (err) {
                    throw err;
                }
                fs.writeFile(configPath + '/SystemConfig.json', JSON.stringify(json), function(err) {
                    if (err)
                        throw err;
                    console.log('SystemConfig reload completed');
                    if (callback) {
                        callback();
                    }
                });
            });
        }
    });
}