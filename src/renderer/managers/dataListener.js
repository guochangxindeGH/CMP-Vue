import {ipcRenderer} from 'electron';

export default {
    created: function () {
        this.init();
    },
    data() {
        return {
            mListenerList: [],
            mAppList: []
        };
    },
    methods: {
        async init() {
            console.log('数据管理器初始化');
            ipcRenderer.on('dataChange', this.dataChange);
        },
        /**
         * 获取当前的App列表
         */
        getAppList() {
            console.log('this.mAppList:' + this.data.mAppList);
            if (this.mAppList.length > 0) {
                console.log('Applist数据已经存在，直接返回');
                return this.mAppList;
            }
            let _queryParam = {
                Null: ''
            };
            ipcRenderer.send('sendPackStepA', {
                packName: 'ReqAppLists',
                opts: _queryParam,
                requestID: 1
            });
        },
        /*
        如果已经被别的订阅，只需要添加监听即可，无需再次向服务器订阅
         */
        addListener(objectId, listener) {
            let _queryParam = {
                Null: ''
            };
            ipcRenderer.send('sendPackStepA', {
                packName: 'ReqAppLists',
                opts: _queryParam,
                requestID: 1111
            });
        },
        dataChange(event, msg) {
            let packName = msg.packName;
            console.log('packName:' + packName);
            if (packName === 'RspError') {
                // 服务器返回Error
                console.log('服务器返回Error');
                debugger;
            }
            if (packName === 'RspAppLists') {
                this.mAppList = [];
                let docs = JSON.parse(msg.packInfo);
                for (let i = 0; i < docs.length; i++) {
                    let value = docs[i].field.values;
                    for (let j = 0; j < value.length; j++) {
                        this.mAppList.push(value[j]);
                    }
                }
                console.log('AppList数据就绪');
            }
        }
    }
};
