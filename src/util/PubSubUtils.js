/**
 * Created by pi.di on 2016/3/28.
 */
var PubSubUtils = {
    editPropsPub : function(pub,topic,args){
        $(pub).trigger(topic,args);
    },
    editPropsSub : function(sub,topic,data,fn){
        $(sub).on(topic,data,fn);
    },
    /**
     *
     * @param obj
     * @param topic
     * @returns {*}
     * @description 检查obj是否绑定了指定的topic事件，jquery v2.2.0暂且支持
     */
    hasBindEvent: function (obj, topic) {
        return $._data(obj, "events") && $._data(obj, "events")[topic];
    }
};

module.exports = PubSubUtils;