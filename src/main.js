import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './styles/global.scss'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// 使用 Element UI
Vue.prototype.$ELEMENT = {
  popperAppendToBody: false
}
Vue.use(ElementUI)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

