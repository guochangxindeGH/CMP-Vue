import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store/index'    //默认store目录下的index.js文件
import iView from 'iview'
import 'iview/dist/styles/iview.css'
import './style/iviewTheme';
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon.vue';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(iView);
Vue.component('v-icon', Icon);

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
