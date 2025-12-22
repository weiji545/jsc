const state = {
  selectedCurrency: (function () {
    try {
      const v = localStorage.getItem('selectedCurrency')
      return v || 'RMB'
    } catch (e) {
      return 'RMB'
    }
  })(),
  baseCurrency: 'RMB',
  rates: {
    RMB: 1,
    DOLLAR: 0.14
  }
}

const mutations = {
  SET_CURRENCY(state, currency) {
    state.selectedCurrency = currency
  },
  SET_RATES(state, rates) {
    state.rates = Object.assign({}, state.rates, rates)
  }
}

const actions = {
  setCurrency({ commit }, currency) {
    commit('SET_CURRENCY', currency)
    try {
      localStorage.setItem('selectedCurrency', currency)
    } catch (e) {
      // ignore
    }
  },
  async fetchRates({ commit, state }) {
    // TODO: 替换为真实的汇率 API
    try {
      const res = await fetch(`/api/exchange-rates?base=${state.baseCurrency}`)
      if (!res.ok) throw new Error('fetch rates failed')
      const data = await res.json()
      // 期望 data 为 { RMB:1, DOLLAR:0.14, ... }
      commit('SET_RATES', data)
    } catch (err) {
      // 获取失败时保持现有 rates
      console.error('获取汇率失败', err)
    }
  }
}

const getters = {
  selectedCurrency(state) {
    return state.selectedCurrency
  },
  rateFor: (state) => (currency) => {
    return state.rates[currency] || 1
  },
  // 返回一个函数用于将 baseAmount 转换为当前选中货币
  convert: (state) => (baseAmount) => {
    const rate = state.rates[state.selectedCurrency] || 1
    return Number(baseAmount) * rate
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}


