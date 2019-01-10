'use strict';
let Utils = {
    requestid: 0,
    getNewRequestID: function() {
        this.requestid += 1;
        return this.requestid;
    },
    /**
     * Date 格式化数据
     * @param  {Date} now [description]
     * @return {Object}     [description]
     */
    getFormatedDate: (now) => {
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var date = now.getDate();

        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();

        if (month < 10) {
            month = '0' + month;
        }
        if (date < 10) {
            date = '0' + date;
        }
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (minute < 10) {
            minute = '0' + minute;
        }
        if (second < 10) {
            second = '0' + second;
        }

        return {
            'year': new String(year),
            'month': new String(month),
            'date': new String(date),
            'hour': new String(hour),
            'minute': new String(minute),
            'second': new String(second)
        }
    }
}

module.exports = Utils;
