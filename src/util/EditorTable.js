/**
 * Created by pi.di on 2016/3/29.
 */
var PropEditType = require('../../../lib/ide/widget/PropEditType.js');
var ControlFactory = require('../../../lib/ide/controls/ControlFactory.js');
var ControlType = require('../../../lib/ide/controls/ControlType.js');
var ListDropDowns = require('../../../lib/ide/controls/publik/ListDropDowns.js');
var Constants = require('../../../lib/ide/widget/Constants.js');
const Utils = require('../../../util/Utils.js');

var EditProp = require('../../js/vo/EditProp.js');
const { ipcRenderer } = require('electron');
const DBClient = require('../../../lib/db/DBClient.js');

var EditorTable = {
    editRow: undefined,
    obj: undefined,
    editRowData: undefined,
    autoCompleteCallback: null,
    //因为数据量较大缓存处理，没有每次重新获取最新数据
    ObjectIDCache: [],
    $number: /^[0-9]*$/g, ///^[0-9]*([Pp][Xx])?$/
    $color: /^(#[0-9a-fA-F]{6}){1}$/g,
    $rgbColor: /^[rR][gG][Bb][Aa]?[\(]([\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),){2}[\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),?[\s]*(0\.\d{1,2}|1|0)?[\)]{1}$/g,
    InlineInput: (function() {
        var autoComplete = {},
            editPropProto = EditProp.prototype;
        var inlineAutoComplete = function(autoCompleteData) {
            var $input = $('<input>'),
                obj = EditorTable.obj;
            $input.val(EditorTable.editRow.data().setting);
            $input.autocomplete({
                //过滤数据，只取以搜索的字符开头的结果
                source: function(request, response) {
                    var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
                    response($.grep(autoCompleteData, function(value) {
                        return matcher.test(value);
                    }));
                }
            });
            $(obj).empty().append($input);
            $input.focus();
            $input.one({
                focusout: function() {
                    $(obj).trigger("updateprop", $input.val());
                }
            })
        };
        ipcRenderer.on('dataChange', (event, msg) => {
            let packName = msg.packName;
            if (packName === 'RspQryMonitorObjectTopic') {
                let docs = JSON.parse(msg.packInfo);
                let values = new Array();
                for (let i = 0; i < docs.length; i++) {
                    values = values.concat(docs[i].field[0].values);
                }
                if (values instanceof Error) {
                    console.error('请求超时，请稍后重试或者重启客户端');
                    return;
                }
                var p,
                    pLen,
                    objectID;
                for (p = 0, pLen = values.length; p < pLen; p++) {
                    objectID = values[p].ObjectID;
                    if (objectID) {
                        EditorTable.ObjectIDCache.push(objectID);
                    }
                }
                let callback = EditorTable.autoCompleteCallback;
                typeof callback === "function" && callback(EditorTable.ObjectIDCache);
                // DBClient.find(packName, (docs) => {
                //     // debugger;
                //     let values = new Array();
                //     for (let i = 0; i < docs.length; i++) {
                //         values = values.concat(docs[i].field[0].values);
                //     }
                //     if (values instanceof Error) {
                //         console.error('请求超时，请稍后重试或者重启客户端');
                //         return;
                //     }
                //     var p,
                //         pLen,
                //         objectID;
                //     for (p = 0, pLen = values.length; p < pLen; p++) {
                //         objectID = values[p].ObjectID;
                //         if (objectID) {
                //             EditorTable.ObjectIDCache.push(objectID);
                //         }
                //     }
                //     let callback = EditorTable.autoCompleteCallback;
                //     typeof callback === "function" && callback(EditorTable.ObjectIDCache);
                // });
            }
        });
        autoComplete[editPropProto.LinkObjectName] = function(callback) {
            EditorTable.autoCompleteCallback = callback;
            if (EditorTable.ObjectIDCache.length === 0) {
                let requestID = Utils.getNewRequestID();
                ipcRenderer.send('sendPackStepA', {
                    packName: 'ReqQryMonitorObjectTopic',
                    opts: {
                        ObjectID: "",
                        StartDate: "",
                        StartTime: "",
                        EndDate: "",
                        EndTime: "",
                        KeepAlive: ""
                    },
                    requestID: requestID
                });

            } else {
                typeof callback === "function" && callback(EditorTable.ObjectIDCache);
            }
        };
        autoComplete[editPropProto.LinkViewName] = function(callback) {
            viewsDB.find({}, (err, docs) => {
                var v,
                    vLen,
                    viewNamesData = [];
                for (v = 0, vLen = docs.length; v < vLen; v++) {
                    viewNamesData.push(docs[v].view);
                }
                // debugger;
                typeof callback === "function" && callback(viewNamesData);
            })
        };
        var inputTypes = {
            inlineInput_Number: function() {
                var _self = EditorTable,
                    $input = $('<input>'),
                    $obj = $(EditorTable.obj);
                var remindMessage = $('#remind-Message');
                $input.val(parseInt(_self.editRow.data().setting));
                $obj.empty().append($input);
                $input.focus();
                $input.on({
                    focusout: function() {
                        if (!_self.$number.test($input.val())) {
                            remindMessage.html('请输入正数!');
                            remindMessage.show();
                        } else {
                            _self.$number.lastIndex = 0;
                            $obj.trigger("updateprop", $input.val());
                            remindMessage.hide();
                        }
                    },
                    keyup: function() {
                        if (!_self.$number.test($input.val())) {
                            remindMessage.html('请输入正数!');
                            remindMessage.show();
                        } else {
                            _self.$number.lastIndex = 0;
                            //$(obj).trigger("updateprop", $input.val());
                            remindMessage.hide();
                        }
                    }
                })
            },
            inlineInput_String: function() {
                var $input = $('<input>'),
                    $obj = $(EditorTable.obj);
                $input.val(EditorTable.editRow.data().setting);
                $obj.empty().append($input);
                $input.focus();
                $input.one({
                    focusout: function() {
                        $obj.trigger("updateprop", $input.val());
                    }
                });
            },
            inlineInput_Color: function() {
                var _self = EditorTable,
                    rowId = EditorTable.editRowData.DT_RowId,
                    wrapDiv = $("<div>"),
                    colorInput = $('<input>'),
                    $obj = $(EditorTable.obj);
                var remindMessage = $('#remind-Message');
                colorInput.addClass("color colorPicker evo-cp0");
                colorInput.css("width", "100px");
                colorInput.attr("value", _self.editRowData.getRawSetting());
                colorInput.attr("id", "color-input-" + rowId);
                wrapDiv.css("width", "130px");
                wrapDiv.append(colorInput);
                $obj.empty().append(wrapDiv);
                colorInput.colorpicker({
                    showOn: "button"
                });
                colorInput.on({
                    "change.color": function(evt, val, type) {
                        if (type === "keyup" || type === "onpaste") {
                            return;
                        }
                        $(this).trigger("focusout", 'keyup');
                        //$(this).trigger("change");
                    },
                    focusout: function() {
                        var a = _self.$rgbColor.test(colorInput.val());
                        var b = _self.$color.test(colorInput.val());
                        if (a || b) {
                            _self.$color.lastIndex = 0;
                            _self.$rgbColor.lastIndex = 0;
                            //$(obj).trigger("updateprop", colorInput.val());
                            remindMessage.hide();
                        } else {
                            remindMessage.html('请输入正确的颜色值!');
                            remindMessage.show();
                        }
                        $obj.trigger("updateprop", colorInput.val());
                    },
                    keyup: function() {
                        var a = _self.$rgbColor.test(colorInput.val());
                        var b = _self.$color.test(colorInput.val());
                        if (a || b) {
                            _self.$color.lastIndex = 0;
                            _self.$rgbColor.lastIndex = 0;
                            remindMessage.hide();
                        } else {
                            remindMessage.html('请输入正确的颜色值!');
                            remindMessage.show();
                        }
                    }
                });
            },
            inlineInput_Picture: function() {
                var $input = $('<input type="file">'),
                    $obj = $(EditorTable.obj);
                $obj.empty().append($input);
                $input.on({
                    change: function() {
                        const path = require('path');
                        var file = this.files[0]; //获取file对象
                        //判断file的类型是不是图片类型。
                        if (!/image\/\w+/.test(file.type)) {
                            alert("文件必须为图片！");
                            return false;
                        }
                        var reader = new FileReader(); //声明一个FileReader实例
                        reader.readAsDataURL(file);
                        var imgName = path.basename(this.value);
                        reader.onload = function(e) {
                            //$(obj).trigger("updateprop",file.name);    
                            $obj.trigger("updateprop", this.result);
                        }
                    }
                });

            },
            inlineInput_DropDown: function() {
                var selectMenu = ControlFactory.createControl(ControlType.ListDropDown, {
                        dropdown: EditorTable.editRowData.dropdown
                    }),
                    $dropdown = selectMenu.getDropDownEle(),
                    $obj = $(EditorTable.obj);
                $obj.empty().append($dropdown);
                $dropdown.selectmenu({
                    create: function(event, ui) {
                        //TODO overrides element.style,hard code
                        $obj.find("span:eq(0)").css("width", $obj.width() * 0.9);
                    },
                    select: function() {
                        $obj.trigger("updateprop", $dropdown.val());
                        //console.log(selectMenu.getDropDownEle().val());
                    }
                });

            },
            inlineInput_AutoComplete: function() {
                var $prop = $(EditorTable.obj).parent().find("td:first-child"),
                    propName = $prop.data(Constants.DataKey.PropName);
                //console.log(propName);
                if (!propName) {
                    LogUtils.log({
                        level: "error",
                        message: "Error: 第一列属性名字不存在，检查table结构!"
                    });
                    return;
                }
                autoComplete[propName] && autoComplete[propName](inlineAutoComplete);
            },
            inlineInput_Disabled: function() {
                var remind = $('<span></span>');
                remind.html('编辑状态下不可修改此参数');
                $(EditorTable.obj).empty().append(remind);
            }
        };

        function inline() {
            inputTypes['inlineInput_' + EditorTable.editRowData.type] &&
                inputTypes['inlineInput_' + EditorTable.editRowData.type]();
        }

        return {
            autoComplete: autoComplete,
            inline: inline
        }
    })(),

    inline: function(obj, editRow) {
        var _self = EditorTable;
        _self.editRow = editRow;
        _self.obj = obj;
        _self.editRowData = _self.editRow.data();
        _self.InlineInput.inline();
    }
};