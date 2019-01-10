/**
 * Created by pi.di on 2016/5/5.
 */
var DBUtils = {
    dirDB: "../db",
    curDB: null,
    DBPool: {},
    getDB: function (dbname) {
        if(this.DBPool[dbname] === undefined){
            const path = require('path');
            const fs = require('fs');
            var dbFile = path.resolve(__dirname, this.dirDB) + path.sep + dbname + '.nosql';
            if (!fs.existsSync(dbFile)) {
                throw new Error("Not exist DB File: " + dbname + '.nosql');
            }
            this.DBPool[dbname] = require('nosql').load(dbFile);
        }
        this.curDB = this.DBPool[dbname];
        return this;
    },
    query: function (map, cb, qmode) {
        if (typeof map !== "function") {
            throw new Error("The argument requires a function!");
        }
        if (typeof cb !== "function") {
            throw new Error("The argument requires a function!");
        }
        if (typeof qmode !== "string") {
            throw new Error("The argument requires a string!");
        } else if (qmode === "one") {
            this.curDB.one(map, cb);
        } else if (qmode === "all"){
            this.curDB.all(map, cb);
        }
    },
    insert: function (data, cb) {
        this.curDB.insert(data, cb);
        return this;
    },
    update: function (fnUpdate, cb) {
        this.curDB.update(fnUpdate, cb);
        return this;
    }
};
