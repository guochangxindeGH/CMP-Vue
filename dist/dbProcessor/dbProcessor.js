module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/dbProcessor/dbProcessor.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/dbProcessor/dbProcessor.js":
/*!****************************************!*\
  !*** ./src/dbProcessor/dbProcessor.js ***!
  \****************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var nedb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! nedb */ \"nedb\");\n/* harmony import */ var nedb__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(nedb__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! body-parser */ \"body-parser\");\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(body_parser__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\n\n\nlet database;\n\nlet warningChanged = true;\n\nlet warningCacheDocs = '';\n\nfunction dbQuery(req, res) {\n    if (warningChanged) {\n        database.find({ 'name': 'RtnWarningEventTopic' }, (err, docs) => {\n            if (err) {\n                throw err;\n            }\n            res.json(docs);\n            warningChanged = false;\n            warningCacheDocs = docs;\n        });\n    } else {\n        res.json(warningCacheDocs);\n    }\n}\n\nfunction dbClean(req, res) {\n    database.remove({}, { multi: true }, (err, numRemoved) => {});\n}\n\nfunction dbSave(req, res) {\n    let mInactiveDebug = false;\n    let odata = req.body.content;\n    let data = JSON.parse(odata);\n    data.timeStamp = new Date().getTime();\n    if (data.name === 'RtnWarningEventTopic') {\n        let warningData = data.field.values[0];\n        let EventNum = warningData.EventNum;\n        if (warningData.EventCount == 0) {\n            warningData.EventCount = 1;\n        }\n        database.update({ 'field.values.EventNum': EventNum }, data, { upsert: true }, (err, numAffected, affectedDocuments, upsert) => {\n            if (err) {\n                throw err;\n            }\n            if (!upsert) {\n                data.field.values[0].EventCount += 1;\n                database.update({ 'field.values.EventNum': EventNum }, data, {}, (err, numAffected) => {});\n                if (mInactiveDebug && data.field.values[0].EventName.indexOf('TM_AppInactive') > -1 && data.field.values[0].OccurDate === '20180718') {\n                    console.log('UUU EventNum:' + data.field.values[0].EventNum + ',Des:' + data.field.values[0].FullEventName + ',Obj:' + data.field.values[0].ObjectID + ',Time:' + data.field.values[0].OccurTime + ',Process:' + data.field.values[0].ProcessFlag);\n                }\n            } else {\n                if (mInactiveDebug && affectedDocuments.field.values[0].EventName.indexOf('TM_AppInactive') > -1 && affectedDocuments.field.values[0].OccurDate === '20180718') {\n                    console.log('SSS EventNum:' + affectedDocuments.field.values[0].EventNum + ',Des:' + affectedDocuments.field.values[0].FullEventName + ',Obj:' + affectedDocuments.field.values[0].ObjectID + ',Time:' + affectedDocuments.field.values[0].OccurTime + ',Process:' + affectedDocuments.field.values[0].ProcessFlag);\n                }\n            }\n            warningChanged = true;\n            res.send('success');\n        });\n    } else {\n        database.insert(data, (err, newDoc) => {\n            if (err) {\n                throw err;\n            }\n            res.send('success');\n        });\n    }\n}\n\nfunction dbUpdate(req, res) {\n    let query = JSON.parse(req.body.query);\n    let update = JSON.parse(req.body.update);\n    res.send('success');\n    database.update(query, update, {}, err => {\n        if (err) {\n            throw err;\n        }\n        database.find(query, (err, docs) => {});\n        res.send('success');\n    });\n}\n\nfunction dbFind(req, res) {\n    let packName = req.params.param;\n    if (packName === 'all') {\n        database.find({}, (err, docs) => {\n            res.json(docs);\n        });\n    } else {\n        database.find({ 'name': packName }, (err, docs) => {\n            if (err) {\n                throw err;\n            }\n            res.json(docs);\n        });\n    }\n}\n\nfunction dbFindOne(req, res) {\n    let packName = req.params.param;\n    let isOne = req.params.one;\n    if (isOne === 'one') {\n        database.findOne({ 'name': packName }, (err, docs) => {\n            if (err) {\n                throw err;\n            }\n            res.json(docs);\n        });\n    } else {\n        res.json({ 'result': 'not one' });\n    }\n}\n\nfunction initWebDb() {\n    database = new nedb__WEBPACK_IMPORTED_MODULE_0___default.a({\n        filename: 'warning.nosql',\n        inMemoryOnly: true\n    });\n    let app = express__WEBPACK_IMPORTED_MODULE_1___default()();\n    app.use(body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.urlencoded({ extended: true }));\n    app.use(body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.json());\n\n    app.get('/warning', dbQuery);\n    app.get('/clean', dbClean);\n    app.post('/save', dbSave);\n    app.post('/update', dbUpdate);\n    app.get('/db/:param/:one', dbFindOne);\n    app.get('/db/:param', dbFind);\n\n    app.listen(3721);\n    console.log('database init complete');\n}\n\ninitWebDb();\n\n//# sourceURL=webpack:///./src/dbProcessor/dbProcessor.js?");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"body-parser\");\n\n//# sourceURL=webpack:///external_%22body-parser%22?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "nedb":
/*!***********************!*\
  !*** external "nedb" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"nedb\");\n\n//# sourceURL=webpack:///external_%22nedb%22?");

/***/ })

/******/ });