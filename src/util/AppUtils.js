/**
 * Created by pi.di on 2016/3/2.
 */
export default {
    OBJECT_ID_SPLITTER: '.',//ObjectID分割器
    ATTR_SPLITTER: ':',//指标分割器
    /**
     *
     * @param objectid e.g.:BTQH.SYS01.app.cffexoffer.1
     * @returns {string} e.g.:BTQHSYS01appcffexoffer1
     */
    convertObjectID4JQ: function (objectid) {
        return objectid.replace(/\./g, '');
    },
    toArray: function (obj) {
        return Array.isArray(obj) ? obj : [obj];
    },
    /**
     * @description 支持原生数组和Jquery对象数组
     * @param array
     * @returns {boolean}
     */
    isBlankArray: function (array) {
        return this.isNullOrUndefined(array) || (typeof array.length !== 'undefined' && array.length === 0);
    },
    /**
     *
     * @param o
     * @returns {Number}
     */
    objectLength: function (o) {
        this.isType('Object', o);
        return Object.keys(o).length;
    },
    /**
     *
     * @param tpl tpl带有{@ }标识
     * @param data
     * @returns {XML|string|void}
     */
    replaceTpl: function (tpl, data) {
        return tpl.replace(/{@(\w+)}/g, function (macth, _$) {
            return data[_$];
        });
    },
    noop: function () {
    },
    errorMsg: function (s) {
        throw new Error(s);
    },
    warnMsg: function (s) {
        console.warn(s);
    },
    interval: function (opts, callback) {
        var that = {},
            intervalId = undefined,
            defaultOpts = {
                time: 1000,
                args: [],
                immediately: false
            },
            options = $.extend(defaultOpts, opts);

        if (typeof callback === 'function') {
            if (options.immediately) {
                callback.apply(null, AppUtils.toArray(options.args));
            }
            intervalId = setInterval(function () {
                callback.apply(null, AppUtils.toArray(options.args));
            }, options.time);
        } else {
            LogUtils.log({
                level: 'error',
                message: 'The argument requires a function!'
            });
        }


        that.clear = function () {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
            }
        };

        return that;
    },
    isType: function (type, object) {
        if (type && typeof type === 'string') {
            type = type.substr(0, 1).toUpperCase() + type.toLowerCase().substr(1);
        } else {
            LogUtils.log({
                level: 'error',
                message: 'The first argument requires a string!'
            });
            return;
        }
        if (Object.prototype.toString.call(object) !== '[object ' + type + ']') {
            this.errorMsg('The object is not a \'' + type + '\'');
        }

    },
    formatTo2Digits: function (time) {
        return time < 10 ? '0' + time : time;
    },
    get2DigitsMonth: function (date) {
        this.isType('Date', date);
        var m = date.getMonth() + 1;
        return this.formatTo2Digits(m);
    },
    get2DigitsDay: function (date) {
        this.isType('Date', date);
        var d = date.getDate();
        return this.formatTo2Digits(d);
    },
    getDate: function (date) {
        this.isType('Date', date);
        var y = date.getFullYear(),
            m = date.getMonth() + 1,
            d = date.getDate();
        //y要按照字符串来处理，否则y+月份可能按照数字处理
        return '' + y + this.formatTo2Digits(m) + this.formatTo2Digits(d);
    },
    getTime: function (date, dateformat) {
        this.isType('Date', date);
        if (dateformat && typeof dateformat === 'string') {
            switch (dateformat.toUpperCase()) {
                case 'HHMMSS':
                    return date.toTimeString().substr(0, 8);
                    break;
                case 'HHMM':
                    return date.toTimeString().substr(0, 5);
                    break;
                default:
                    break;
            }
        }
        return date.toTimeString().substr(0, 8);
    },
    /**
     * @param d date类型
     * @returns {boolean}
     * @description 是否为晚上，大于等于19点
     */
    isNight: function (d) {
        this.isType('Date', d);
        return d.getHours() >= 19;
    },
    timeAddHour: function (oldTime, interval) {
        if (oldTime) {
            oldTime += '';
            var strHour = oldTime.substr(0, 2),
                hour = +strHour;
        } else {
            return;
        }
        if (interval) {
            hour += interval;
            if (hour < 10 && hour >= 0) {
                strHour = '0' + hour;
            } else if (hour >= 10 && hour <= 23) {
                strHour = '' + hour;
            } else if (hour > 23) {
                strHour = '23';
            } else if (hour < 0) {
                strHour = '00';
            }
            return strHour + oldTime.substr(2);
        } else {
            return oldTime;
        }
    },
    isNullOrUndefined: function (o) {
        return o === null || o === undefined;
    },
    isBlankString: function (s) {
        return this.isNullOrUndefined(s) || (typeof s === 'string' && s.trim() === '');
    },
    /**
     *
     * @param checkObj  待检测属性的对象
     * @param propertyPath 待检测的对象的属性路径，
     * e.g.:s = {s1:1,s2:{s21:"s21",s22:"s22"}}，path取值可以是"s1","s2","s2.s21"
     * @returns {boolean}
     */
    isPropertyNull: function (checkObj, propertyPath) {
        if (this.isNullOrUndefined(checkObj)) {
            return true;
        }
        this.isType('String', propertyPath);
        var leftPathStart = propertyPath.indexOf('.');
        if (leftPathStart > -1) {
            return this.isPropertyNull(checkObj[propertyPath.substring(0, leftPathStart)],
                propertyPath.substring(leftPathStart + 1));
        } else {
            if (this.isNullOrUndefined(checkObj[propertyPath])) {
                return true;
            }
        }
        return false;
    },
    remoteCall: function (options) {
        if (this.isPropertyNull(options, 'uiInterface')) {
            this.errorMsg('The uiInterface is not defined');
        }
        if (this.isPropertyNull(options, 'method')) {
            this.errorMsg('The method is not defined');
        }
        var fn = options.uiInterface[options.method];
        this.isType('Function', fn);
        var defaultOpts = {
                uiInterface: null,
                method: null,
                args: null,
                callback: null
            },
            _args = [];
        options = JqueryUtils.extend(defaultOpts, options);
        if (!this.isNullOrUndefined(options.args)) {
            _args.push(options.args);
        }
        if (!this.isNullOrUndefined(options.callback)) {
            _args.push(options.callback);
        }
        if (!this.isNullOrUndefined(options.timeout)) {
            _args.push(options.timeout);
        }
        fn.apply(null, _args);
    },

    /**
     * @description 取页面参数,返回Map对象
     * @returns {{}}
     */
    getParameters: function () {
        var params = window.location.search,
            paramMap = {},
            paramArr;
        if (!this.isBlankString(params)) {
            params.substring(1).split('&').forEach(function (paramPair) {
                paramArr = paramPair.split('=');
                paramMap[paramArr[0]] = paramArr[1];
            });
        } else {
            this.warnMsg('No parameters found!');
        }
        return paramMap;
    },
    /**
     * @description 根据key取页面参数值
     * @param paramKey
     * @returns {string}
     */
    getParameter: function (paramKey) {
        var paramMap = this.getParameters();
        if (this.isNullOrUndefined(paramMap[paramKey])) {
            this.warnMsg('No parameter \'' + paramKey + '\' found!');
        }
        return paramMap[paramKey];
    },
    /**
     * 根据时间判断是夜盘还是日盘
     * 夜盘早于日盘
     * @return {[Boolean]} [true表示夜盘，false表示日盘]
     */
    dayOrNight: (timestr) => {
        return timestr > '19:00:00' && timestr < '23:59:59';
    }
};
