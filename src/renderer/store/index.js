import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';  //添加persistedstate插件


/**
 * 参数说明
 * 1、目录，也就是当前目录
 * 2、是否包含子目录中的文件
 * 3、引入的文件的匹配表达式
 */
const files = require.context('./modules', false, /\.js$/);
const modules = {};

/**m
 * 作用：扫描modules目录下面所有的store文件，然后统一加入到vuex中
 */
files.keys().forEach(key => {
    modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default;
});

Vue.use(Vuex);

export default new Vuex.Store({
    modules,
    plugins: [createPersistedState({
        reducer(state) {
            return {
                // 只保存某些store
                Account: state.Account,
            };
        }
    })],
    strict: process.env.NODE_ENV !== 'production'
});
