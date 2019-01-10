/**
 * Created by pi.di on 2016/3/31.
 * interface function for global call
 */
var InterfaceUtils = {
    pageParamToTreeView: undefined,
    pageParamToAttrDetail: undefined,
    subRTAttrMap: {},
    showPropEditTable: function (elem) {
        logicView.fn.initTable(elem);
    },
    /**
     * @description 为了支持自动打开已打开的指标和详细页面
     * @param args
     */
    addHasShowDetail: function (args) {
        monitorObjList.addToHasDetail(args.objectId, args.objectAttr);
    },
    /**
     * @description 为了支持自动打开已打开的指标和详细页面
     * @param args
     */
    removeHasShowDetail: function (args) {
        monitorObjList.removeFromHasDetail(args.objectId, args.objectAttr);
    },
    initObjAttrList: function (objectId) {
        objAttrList.interfaces.initialize(objectId);
    },
    unSubRealTimeAttrDataById: function (objectId) {
        if(objectId === undefined){
            return;
        }
        var attrList = InterfaceUtils.subRTAttrMap[objectId];
        if(attrList === undefined){
            return;
        }
        var objectAttrUIInteface = require('../rendererprocess/ui-interface/object-attr-ui-interface.js'),
            cacheDB = require('electron').remote.require('./mainprocess/db/cache-data.js'),
            i,
            len = attrList.length,
            baseObjectID = objectId + AppUtils.ATTR_SPLITTER,
            param = {
                'ObjectID': '',
                'ObjectNum': 1,
                'KeepAlive': 0,//退订
                'MonDate': '',
                'MonTime': ''
            };
        for (i = 0; i < len; i++) {
            param.ObjectID = baseObjectID + attrList[i]._attrid;
            cacheDB.removeCacheData(param.ObjectID);
            AppUtils.remoteCall({
                uiInterface: objectAttrUIInteface,
                method: "unsubQryRealTimeObjectAttr",
                args: param,
                callback: AppUtils.noop
            });
        }
    },
    createChart: function (params) {
        attrDetail.createChart(params);
    },
    setPageParamToTreeView: function (param) {
        this.pageParamToTreeView = param;
    },
    getPageParamToTreeView: function () {
        return this.pageParamToTreeView;
    },
    setPageParamToAttrDetail: function (param) {
        this.pageParamToAttrDetail = param;
    },
    getPageParamToAttrDetail: function () {
        return this.pageParamToAttrDetail;
    },
    /**
     *
     * @param pageId ,将要打开页面的id属性值
     * @param pageParam e.g.:BTQH.SYS01.app.cffexoffer.1:INodeUsage
     */
    loadPage: function (pageId, pageParam) {
        if (pageId && pageParam === undefined) {
            $("#" + pageId).trigger("click");
            return;
        }
        var params = pageParam.split(AppUtils.ATTR_SPLITTER),
            pages = ["treeview", "warningview", "logicview"];
        if(pages.indexOf(pageId) === -1){
            LogUtils.log({
                level: "error",
                message: "App has not this page:" + pageId + ",valid pages:[" + pages + "]!"
            });
            return;
        }
        InterfaceUtils.setPageParamToTreeView(params[0]);
        InterfaceUtils.setPageParamToAttrDetail(params[1]);
        $("#" + pageId).trigger("click");
    }
};

module.exports=InterfaceUtils;