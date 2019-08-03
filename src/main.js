import Vue from 'vue'

import Router from 'vue-router'
import VueSidebarMenu from 'vue-sidebar-menu'

import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import '@magenta/music';
import App from './App.vue'
import router from './router'

import './checkpoints/config'

Vue.use(Router)
Vue.use(VueSidebarMenu)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
