import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store/index'    //默认store目录下的index.js文件

import iView from 'iview'
import 'iview/dist/styles/iview.css'
import './style/iviewTheme';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon.vue';
import Echarts from 'echarts'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios;

Vue.config.productionTip = false
Vue.use(iView);
Vue.use(ElementUI);
Vue.prototype.echarts = Echarts
Vue.use(Echarts)

Vue.component('v-icon', Icon);


//配置全局的axios默认值（可选）
axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';



Vue.http = Vue.prototype.$http = axios

// 务必在加载 Vue 之后，立即同步设置以下内容
//配置是否允许 vue-devtools 检查代码。开发版本默认为 true，生产版本默认为 false。生产版本设为 true 可以启用检查。
Vue.config.devtools = true


/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    store,
    template: '<App/>'
}).$mount('#app')


// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});
