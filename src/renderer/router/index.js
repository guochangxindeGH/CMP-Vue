import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '@/components/LandingPage/LandingPage.vue'
import LoginScreen from '@/components/loginScreen/Login.vue'
import MainScreen from '@/components/mainScreen/MainScreen.vue'

import IndicatorScreen from '@/components/indicatorScreen/IndicatorScreen.vue'
import AppViewScreen from '@/components/indicatorScreen/appViewScreen/AppViewScreen.vue'
import HardwareViewScreen from '@/components/indicatorScreen/hardwareViewScreen/HardwareViewScreen.vue'
import WarningScreen from '@/components/warningScreen/WarningScreen.vue'
import MaintenanceScreen from '@/components/maintenanceScreen/MaintenanceScreen.vue'
import TreeviewScreen from '@/components/treeviewScreen/TreeviewScreen.vue'

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
