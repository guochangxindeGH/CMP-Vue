/**
 * 这是内存数据库进程，通过express搭建了服务端，接受数据的入库、查询等操作
 */
import Datastore from 'nedb';
import express from 'express';
import bodyParser from 'body-parser';

/**
 * 内存数据库
 */
let database;

/**
 * 告警信息是否改变，如果没有改变，无需从数据库读取，直接从缓存读取即可
 */
let warningChanged = true;

/**
 * 告警内容缓存
 */
let warningCacheDocs = '';


function dbQuery(req, res) {
    if (warningChanged) {
        // console.log("从数据库查询告警信息");
        database.find({'name': 'RtnWarningEventTopic'}, (err, docs) => {
            if (err) {
                throw err;
            }
            res.json(docs);
            warningChanged = false;
            warningCacheDocs = docs;
        });
    } else {
        // console.log("数据库内容没有改变，直接从缓存返回告警信息");
        res.json(warningCacheDocs);
    }
}

function dbClean(req, res) {
    database.remove({}, {multi: true}, (err, numRemoved) => {
    });
}

function dbSave(req, res) {
    let mInactiveDebug = false;
    let odata = req.body.content;
    let data = JSON.parse(odata);
    data.timeStamp = new Date().getTime();
    if (data.name === 'RtnWarningEventTopic') {
        //告警
        let warningData = data.field.values[0];
        let EventNum = warningData.EventNum;
        if (warningData.EventCount == 0) {
            warningData.EventCount = 1;
        }
        database.update({'field.values.EventNum': EventNum}, data, {upsert: true}, (err, numAffected, affectedDocuments, upsert) => {
            if (err) {
                throw err;
            }
            if (!upsert) {
                data.field.values[0].EventCount += 1;
                database.update({'field.values.EventNum': EventNum}, data, {}, (err, numAffected) => {
                });
                if (mInactiveDebug && (data.field.values[0].EventName.indexOf('TM_AppInactive') > -1) && (data.field.values[0].OccurDate === '20180718')) {
                    console.log('UUU EventNum:' + data.field.values[0].EventNum
                        + ',Des:' + data.field.values[0].FullEventName
                        + ',Obj:' + data.field.values[0].ObjectID
                        + ',Time:' + data.field.values[0].OccurTime
                        + ',Process:' + data.field.values[0].ProcessFlag);
                }
            } else {
                if (mInactiveDebug && (affectedDocuments.field.values[0].EventName.indexOf('TM_AppInactive') > -1) && (affectedDocuments.field.values[0].OccurDate === '20180718')) {
                    console.log('SSS EventNum:' + affectedDocuments.field.values[0].EventNum
                        + ',Des:' + affectedDocuments.field.values[0].FullEventName
                        + ',Obj:' + affectedDocuments.field.values[0].ObjectID
                        + ',Time:' + affectedDocuments.field.values[0].OccurTime
                        + ',Process:' + affectedDocuments.field.values[0].ProcessFlag);
                }
            }
            warningChanged = true;
            res.send('success');
        });
    } else {
        //其他,未知单由于暂时没有特殊情况，直接保存
        database.insert(data, (err, newDoc) => {
            if (err) {
                throw err;
            }
            res.send('success');
        });
    }
}

function dbUpdate(req, res) {
    let query = JSON.parse(req.body.query);
    let update = JSON.parse(req.body.update);
    res.send('success');
    database.update(query, update, {}, (err) => {
        if (err) {
            throw err;
        }
        database.find(query, (err, docs) => {
            // debugger;
        });
        res.send('success');
    });
}

/**
 * 浏览器可以通过 http://localhost:3721/db/all 来查看内存数据库
 */
function dbFind(req, res) {
    let packName = req.params.param;
    if (packName === 'all') {
        database.find({}, (err, docs) => {
            // let data = JSON.stringify(docs);
            res.json(docs);
        });
    } else {
        database.find({'name': packName}, (err, docs) => {
            if (err) {
                throw err;
            }
            res.json(docs);
        });
    }
}

function dbFindOne(req, res) {
    let packName = req.params.param;
    let isOne = req.params.one;
    if (isOne === 'one') {
        database.findOne({'name': packName}, (err, docs) => {
            if (err) {
                throw err;
            }
            res.json(docs);
        });
    } else {
        res.json({'result': 'not one'});
    }
}

function initWebDb() {
    database = new Datastore({
        filename: 'warning.nosql',
        inMemoryOnly: true
    });
    let app = express();
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    app.get('/warning', dbQuery);
    app.get('/clean', dbClean);
    app.post('/save', dbSave);
    app.post('/update', dbUpdate);
    app.get('/db/:param/:one', dbFindOne);
    app.get('/db/:param', dbFind);

    app.listen(3721);
    console.log('database init complete');
}

initWebDb();

