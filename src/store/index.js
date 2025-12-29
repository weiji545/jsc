import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import currency from './modules/currency'
import theme from './modules/theme'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    currency,
    theme,
  },
  actions: {
    // 兼容旧调用：root action 代理到 theme 模块
    setDarkMode({ dispatch }, val) {
      return dispatch('theme/setDarkMode', val)
    },
  },
  getters: {
    // 兼容旧 getter 访问：从 theme 模块读取
    isDarkMode(state) {
      return !!(state.theme && state.theme.isDarkMode)
    },
  },
})


