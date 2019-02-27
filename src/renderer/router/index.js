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

export default new Router({
  routes: [
      {
          path: '/',
          redirect: '/login'
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
                  component: WarningScreen
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
      },
  ]
})
