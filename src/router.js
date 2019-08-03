import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/play',
      name: 'playground',
      component: () => import(/* webpackChunkName: "playground" */ './views/Playground.vue')
    },
    {
      path: '/play/trio4bar',
      name: 'trio4bar',
      component: () => import(/* webpackChunkName: "playground" */ './views/playground/Trios4bar.vue')
    }
  ]
})
