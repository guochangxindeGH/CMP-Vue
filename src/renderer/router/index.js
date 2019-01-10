import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '@/components/LandingPage.vue'

import LoginScreen from '@/components/loginScreen/Login.vue'

Vue.use(Router)

export default new Router({
  routes: [
      {
          path: '/',
          redirect: '/login'
      },
      {
          path: '/login',
          name: 'login',
          component: LoginScreen
      },
  ]
})
