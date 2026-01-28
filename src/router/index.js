import Vue from 'vue'
import VueRouter from 'vue-router'
// import Dashboard from '../views/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/overview',
  },
  {
    path: '/overview',
    name: 'Overview',
    component: () => import('../views/index.vue'),
  },
  {
    path: '/accountManagement',
    name: 'AccountManagement',
    component: () => import('../views/index.vue'),
  },
  {
    path: '*',
    redirect: '/overview',
  },
]

const router = new VueRouter({
  mode: 'hash', // 使用 hash 避免刷新 404
  routes,
})

export default router
