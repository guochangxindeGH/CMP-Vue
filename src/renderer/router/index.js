import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '@/components/LandingPage/LandingPage.vue'
import LoginScreen from '@/components/loginScreen/Login.vue'
import MainScreen from '@/components/mainScreen/MainScreen.vue'

import IndicatorScreen from '@/components/indicatorScreen/IndicatorScreen.vue'
import AppViewScreen from '@/components/indicatorScreen/appViewScreen/AppViewScreen.vue'
import HardwareViewScreen from '@/components/indicatorScreen/hardwareViewScreen/HardwareViewScreen.vue'


Vue.use(Router)

export default new Router({
  routes: [
      {
          path: '/',
          redirect: '/login-page'
      },
      {
          path: '/landing',
          name: 'landing-page',
          component: LandingPage
      },
      {
          path: '/login-page',
          name: 'login-page',
          component: LoginScreen
      },
      {
          path: '/main-page',
          name: 'main-page',
          component: MainScreen,
          redirect: '/main-page/indicator',
          children: [
              {
                  path: '/main-page/indicator',
                  name: 'indicator',
                  component: IndicatorScreen,
                  redirect: '/main-page/indicator/app',
                  children: [
                      {
                          path: '/main-page/indicator/app',
                          name: 'appView',
                          component: AppViewScreen
                      }, {
                          path: '/main-page/indicator/hardware',
                          name: 'hardwareView',
                          component: HardwareViewScreen
                      }
                  ]
              },
          ]
      },
  ]
})
