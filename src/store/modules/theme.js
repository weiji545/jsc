const getInitialDarkMode = () => {
  try {
    const v = localStorage.getItem('isDarkMode')
    if (v !== null) return v === 'true' || v === '1' || v === 'dark'
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return true
  } catch (e) {
    return true
  }
}

const state = {
  isDarkMode: getInitialDarkMode()
}

const mutations = {
  SET_DARK_MODE(state, val) {
    state.isDarkMode = !!val
  }
}

const actions = {
  setDarkMode({ commit }, val) {
    commit('SET_DARK_MODE', val)
    try {
      localStorage.setItem('isDarkMode', (!!val).toString())
    } catch (e) {
      // ignore
    }
  }
}

const getters = {
  isDarkMode(state) {
    return !!state.isDarkMode
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}


