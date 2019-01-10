/**
 * Created by pi.di on 2016/5/30.
 */
var LogUtils = (function () {
    var that = {
            log: AppUtils.noop
        },
    //开发模式开关
        isDebugMode = true,
        defaultLevel = "log";


    if (isDebugMode === false) {
        return that;
    }

    var formatArgs = function (value) {
        var i,
            len,
            s,
            msgPrefix,
            msgSuffix,
            msg = "",
            connector = ", ";
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                msgPrefix = " [";
                msgSuffix = "]";
                len = value.length;
                for (i = 0; i < len; i++) {
                    msg += connector + formatArgs(value[i]);
                }
            } else {
                msgPrefix = " {";
                msgSuffix = "}";
                for (s in value) {
                    if (value.hasOwnProperty(s)) {
                        msg += connector + s + ": " + formatArgs(value[s]);
                    }
                }
            }
            return msgPrefix + msg.substr(connector.length) + msgSuffix;
        } else {
            return value;
        }
    };

    that.warn = function (msg) {
        console.warn(msg);
    };

    that.error = function (msg) {
        console.error(msg);
    };

    that.log = function (msg) {
        console.log(msg);
    };

    that.info = function (msg) {
        console.info(msg);
    };

    var log = function (args) {
        if (args === undefined) {
            return;
        }
        if (typeof args === "string") {
            that.log(args);
            return;
        }

        var level = args.level || defaultLevel,
            msg = args.message || "[ Message ]",
            _arguments = args.args;

        if (that[level] === undefined) {
            that.error("Valid level values: [log, info, warn, error]!");
            return;
        }
        if (_arguments !== undefined) {
            msg += "\n" + "Arguments:" + formatArgs(_arguments);
        }
        that[level](msg);
    };

    return {
        log: log
    };
})();