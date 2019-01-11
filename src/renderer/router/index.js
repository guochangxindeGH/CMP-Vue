import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '@/components/LandingPage/LandingPage.vue'
import LoginScreen from '@/components/loginScreen/Login.vue'
import MainScreen from '@/components/mainScreen/MainScreen.vue'


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
          redirect: '/main-page/landing',
          children: [
              {
                  path: '/main-page/landing',
                  name: 'landing-page',
                  meta: {
                      title: '首页'
                  },
                  component: LandingPage
              }]
      },
  ]
})
