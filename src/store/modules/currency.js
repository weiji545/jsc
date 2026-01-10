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
    DOLLAR: 0.14,
  },
}

const mutations = {
  SET_CURRENCY(state, currency) {
    state.selectedCurrency = currency
  },
  SET_RATES(state, rates) {
    state.rates = Object.assign({}, state.rates, rates)
  },
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
}

const getters = {
  selectedCurrency(state) {
    return state.selectedCurrency
  },
  // 返回一个函数用于将 baseAmount 转换为当前选中货币
  convert: (state) => (baseAmount) => {
    if (baseAmount === null || baseAmount === undefined || baseAmount === '') {
      return baseAmount
    }
    const rate = state.rates[state.selectedCurrency] || 1
    return Number(baseAmount) * rate
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}


