import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from 'dirScreens/LandingPage/LandingPage.vue'
import LoginScreen from 'dirScreens/loginScreen/Login.vue'
import MainScreen from 'dirScreens/mainScreen/MainScreen.vue'

import IndicatorScreen from 'dirScreens/indicatorScreen/IndicatorScreen.vue'
import AppViewScreen from 'dirScreens/indicatorScreen/appViewScreen/AppViewScreen.vue'
import HardwareViewScreen from 'dirScreens/indicatorScreen/hardwareViewScreen/HardwareViewScreen.vue'
// import WarningScreen from 'dirScreens/warningScreen/WarningScreen.vue'  //不进行页面按需加载引入方式
const WarningScreen = r => require.ensure( [], () => r (require('dirScreens/warningScreen/WarningScreen.vue')))     //进行页面按需加载的引入方式(懒加载)
import MaintenanceScreen from 'dirScreens/maintenanceScreen/MaintenanceScreen.vue'
import TreeviewScreen from 'dirScreens/treeviewScreen/TreeviewScreen.vue'

Vue.use(Router)

//列举需要判断登录状态的“路由集合”，当跳转至集合中的路由时，如果“未登录状态”，则跳转到登录页面login；
//当直接进入登录页面login时，如果“已登录状态”，则跳转到首页home；
const router = new Router({
    routes: [
        {
            path: '/',  // 默认进入路由
            redirect: '/login'  //重定向
        },
        {
            path: '/landing',
            name: 'landing',
            component: LandingPage
        },
        {
            path: '/login',
            name: 'login',
            component: LoginScreen
        },
        {
            path: '/main',
            name: 'main',
            component: MainScreen,
            redirect: '/main/indicator',
            children: [
                {
                    path: '/main/indicator',
                    name: 'indicator',
                    component: IndicatorScreen,
                    redirect: '/main/indicator/app',
                    children: [
                        {
                            path: '/main/indicator/app',
                            name: 'app',
                            component: AppViewScreen
                        }, {
                            path: '/main/indicator/hardware',
                            name: 'hardware',
                            component: HardwareViewScreen
                        }
                    ]
                },
                {
                    path: '/main/warning',
                    name: 'warning',
                    component: WarningScreen,
                    // 路由里面的钩子
                    beforeRouteEnter: () => {

                    },
                    beforeRouteUpdate: () => {

                    },
                    beforeRouteLeave: () => {

                    },
                    //单独路由独享组件
                    beforeEach: () => {

                    }
                },
                {
                    path: '/main/maintenance',
                    name: 'maintenance',
                    component: MaintenanceScreen
                },
                {
                    path: '/main/treeview',
                    name: 'treeview',
                    component: TreeviewScreen
                }
            ]
        }
    ],
    // 全局路由守卫
    beforeEach(to, from, next) {
        console.log('navigation-guards');
        // to: Route: 即将要进入的目标 路由对象
        // from: Route: 当前导航正要离开的路由
        // next: Function: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
        const route = ['home', 'list'];
        // let isLogin = isLogin;  // 是否登录
        // 未登录状态；当路由到route指定页时，跳转至login
        if (route.indexOf(to.name) >= 0) {
            if (!isLogin) {
                this.$router.push({ path:'/login',});
            }
        }
        // 已登录状态；当路由到login时，跳转至home
        if (to.name === 'login') {
            if (isLogin) {
                this.$router.push({ path:'/home',});;
            }
        }
        next();
    }
});



export default router;

// export default new Router({
//   routes: [
//       {
//           path: '/',
//           redirect: '/login'
//       },
//       {
//           path: '/landing',
//           name: 'landing',
//           component: LandingPage
//       },
//       {
//           path: '/login',
//           name: 'login',
//           component: LoginScreen
//       },
//       {
//           path: '/main',
//           name: 'main',
//           component: MainScreen,
//           redirect: '/main/indicator',
//           children: [
//               {
//                   path: '/main/indicator',
//                   name: 'indicator',
//                   component: IndicatorScreen,
//                   redirect: '/main/indicator/app',
//                   children: [
//                       {
//                           path: '/main/indicator/app',
//                           name: 'app',
//                           component: AppViewScreen
//                       }, {
//                           path: '/main/indicator/hardware',
//                           name: 'hardware',
//                           component: HardwareViewScreen
//                       }
//                   ]
//               },
//               {
//                   path: '/main/warning',
//                   name: 'warning',
//                   component: WarningScreen
//               },
//               {
//                   path: '/main/maintenance',
//                   name: 'maintenance',
//                   component: MaintenanceScreen
//               },
//               {
//                   path: '/main/treeview',
//                   name: 'treeview',
//                   component: TreeviewScreen
//               }
//           ]
//       },
//   ]
// })


