import Router from 'vue-router'
import Home from './views/Home.vue'

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
      path: '/play/:vaename',
      name: 'item',
      component: () => import(/* webpackChunkName: "playground" */ './views/PlaygroundItem.vue')
    }
  ]
})
