import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '../views/dashboard/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '*',
    redirect: '/dashboard',
  },
]

const router = new VueRouter({
  mode: 'hash', // 使用 hash 避免刷新 404
  routes,
})

export default router

