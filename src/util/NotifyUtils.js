/**
 * Created by pi.di on 2016/5/26.
 */

function NotifyUtils(opts) {
    var that = {},
        defaultOpts = {
            layout: "topCenter",
            modal: true,
            timeout: 2500
        };
    opts = JqueryUtils.extend(defaultOpts, opts);
    that.n = noty(opts);
    if (opts.console !== undefined) {
        switch (opts.type) {
            case undefined:
                break;
            case "alert":
                console.log(opts.console);
                break;
            case "information":
                console.info(opts.console);
                break;
            case "warning":
                console.warn(opts.console);
                break;
            case "error":
                console.error(opts.console);
                break;
            default:
                break;
        }
    }
    return that;
}