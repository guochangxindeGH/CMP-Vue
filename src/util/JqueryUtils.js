/**
 * Created by pi.di on 2016/3/7.
 */
var JqueryUtils = {
    _Connection: "-",
    _LOADING_DIV: null,
    _LOADING_TIP: "正在加载...",
    _IMG_PATH: "images/",

    toggleShowHide: function (obj) {
        if (obj.is(':hidden')) {
            obj.show();
        } else {
            obj.hide();
        }
    },
    /**
     * @description bootstrap class
     * @param dom
     */
    showByClass: function (dom) {
        $(dom).removeClass("hidden").addClass("show");
    },
    hideByClass: function (dom) {
        $(dom).removeClass("show").addClass("hidden");
    },
    /**
     * @description 占空间式隐藏，为了使用动态生成的dom的width,height
     * @param dom
     */
    showByVisibility: function (dom) {
        $(dom).css("visibility", "visible");
    },
    hideByVisibility: function (dom) {
        $(dom).css("visibility", "hidden");
    },
    concatObjectId: function (obj, objectId, connection) {
        obj.attr("id", obj.attr("id") + (connection ? connection : this._Connection) + objectId);
    },

    isEmptyObject: $.isEmptyObject,

    extend: $.extend,

    createDOM: function (opts) {
        if (opts === undefined || opts.tag === undefined) {
            LogUtils.log({
                level: "error",
                args: opts,
                message: "createDOM(): Argument is invalid!"
            });
            return;
        }
        var $dom,
            p;
        if (opts.tag) {
            $dom = $("<" + opts.tag + ">");
        }
        if (opts.className) {
            $dom.addClass(opts.className);
        }
        if (opts.style) {
            for (p in opts.style) {
                if (opts.style.hasOwnProperty(p)) {
                    $dom.css(p, opts.style[p]);
                }
            }
        }
        if (opts.attrs) {
            for (p in opts.attrs) {
                if (opts.attrs.hasOwnProperty(p)) {
                    $dom.attr(p, opts.attrs[p]);
                }
            }
        }
        if (opts.child) {
            $dom.append(opts.child);
        }
        if (opts.parent) {
            opts.parent.append($dom);
        }
        return $dom;
    },
    createView: function (opts) {
        if (opts === undefined || opts.tpl === undefined
            || opts.data === undefined) {
            LogUtils.log({
                level: "error",
                args: opts,
                message: "createView(): Argument is invalid!"
            });
            return;
        }
        var html = "",
            i,
            len;
        opts.data = AppUtils.toArray(opts.data);

        for (i = 0, len = opts.data.length; i < len; i++) {
            html += AppUtils.replaceTpl(opts.tpl, opts.data[i]);
        }

        if (opts.parent) {
            opts.parent.append(html);
        }

        if (opts.afterCreated && typeof opts.afterCreated === "function") {
            opts.afterCreated($(html));
        }
        html = "";
    },
    showLoading: function (opts) {
        var defaultOpts = {
            container: $("body"),
            multiple: false
        };
        opts = $.extend(defaultOpts, opts);
        var $container = opts.container,
            $loadingDiv = $container.get(0).loadingDiv || JqueryUtils._LOADING_DIV,
            $inner = '<table cellSpacing="8">' +
                '<tr>' +
                '<td style="width: 50px">' +
                '<img src="' + JqueryUtils._IMG_PATH + 'loading.gif">' +
                '</td>' +
                '<td style="white-space: nowrap">' + JqueryUtils._LOADING_TIP + "</td>" +
                '</tr></table>';
        if ($loadingDiv === null && !opts.multiple) {
            $loadingDiv = JqueryUtils._LOADING_DIV = JqueryUtils.createDOM({
                tag: "div",
                className: "loading-div",
                style: {
                    display: "none"
                },
                child: $inner,
                parent: $container
            });
        }
        if (opts.multiple && !$container.get(0).loadingDiv) {
            $loadingDiv = $container.get(0).loadingDiv = JqueryUtils.createDOM({
                tag: "div",
                className: "loading-div",
                style: {
                    display: "none",
                },
                child: $inner,
                parent: $container
            });
        }
        $loadingDiv.css("display", "");
        var cl = $container.scrollLeft(),
            ct = $container.scrollTop(),
            cw = $container.get(0).clientWidth,
            ch = $container.get(0).clientHeight,
            dw = $loadingDiv.outerWidth(),
            dh = $loadingDiv.outerHeight();
        $loadingDiv.css("left", cl + (cw - dw) / 2).css("top", ct + (ch - dh) / 2);
    },
    hideLoading: function (container) {
        if (container && container.get(0).loadingDiv) {
            $(container.get(0).loadingDiv).css("display", "none");
            return;
        }
        if (JqueryUtils._LOADING_DIV !== null) {
            JqueryUtils._LOADING_DIV.css("display", "none");
            JqueryUtils._LOADING_DIV = null;
        }
    }
};
module.exports = JqueryUtils;