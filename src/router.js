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
    },
    {
      path: '/interpolate/multitrack-chords',
      name: 'interpolate-multitrack-chords',
      component: () => import(/* webpackChunkName: "interpolate-multitrack-chords" */ './views/interpolate/MultitrackChords.vue')
    },
    {
      path: '/interpolate/sample-with-chords',
      name: 'interpolate-sample-with-chords',
      component: () => import(/* webpackChunkName: "interpolate-multitrack-chords" */ './views/interpolate/SampleWithChords.vue')
    }
  ]
})
