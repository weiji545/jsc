import Vue from 'vue'
import Vuex from 'vuex'
import currency from './modules/currency'
import theme from './modules/theme'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    currency,
    theme,
  }
})


