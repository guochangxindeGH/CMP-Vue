/**
 * Created by pi.di on 2016/5/30.
 */
var Throttler = function () {
    const AppUtils=require('./AppUtils.js');
    var that = {},
        timeoutId = undefined,
        defaultOpts = {
            time: 300,
            context: null,
            args: []
        },
        options;

    that.active = function (fn, opts, isClear) {
        if (typeof isClear === "boolean" && isClear === true) {
            that.clear();
        } else {
            options = $.extend(defaultOpts, opts);
            that.active(fn, options, true);
            timeoutId = setTimeout(function () {
                var args = options.args;
                args = AppUtils.toArray(args);
                fn.apply(options.context, args);
            }, options.time);
        }
    };

    that.clear = function () {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
        }
    };

    return that;
};
module.exports = Throttler;
