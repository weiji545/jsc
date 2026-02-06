import Vue from 'vue'
import VueRouter from 'vue-router'
// import Dashboard from '../views/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/over-view',
  },
  {
    path: '/over-view',
    name: 'OverView',
    component: () => import('../views/index.vue'),
  },
  {
    path: '/account-management',
    name: 'AccountManagement',
    component: () => import('../views/index.vue'),
  },
  {
    path: '/configurable-layout',
    name: 'ConfigurableLayout',
    component: () => import('../views/index.vue'),
  },
  {
    path: '*',
    redirect: '/over-view',
  },
]

const router = new VueRouter({
  mode: 'hash', // 使用 hash 避免刷新 404
  routes,
})

export default router
