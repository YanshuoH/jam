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
      component: () => import(/* webpackChunkName: "interpolate-sample-with-chords" */ './views/interpolate/SampleWithChords.vue')
    },
    {
      path: '/interpolate/style-transition',
      name: 'interpolate-style-transition',
      component: () => import(/* webpackChunkName: "interpolate-learn-style" */ './views/interpolate/StyleTransition.vue')
    },
    {
      path: '/interpolate/learn-style-with-chord',
      name: 'interpolate-learn-style-with-chord',
      component: () => import(/* webpackChunkName: "interpolate-learn-style-with-chord" */ './views/interpolate/LearnStyleWithChord.vue')
    },
    {
      path: '/demo/sweet-child-o-mine',
      name: 'demo-sweet-child-o-mine',
      component: () => import(/* webpackChunkName: "interpolate-learn-style-with-chord" */ './views/demo/SweetChildOMine.vue')
    }
  ]
})
