const getInitialDarkMode = () => {
  try {
    const v = localStorage.getItem('isDarkMode')
    // 如果 localStorage 有值，使用存储的值
    if (v !== null) return v === 'true' || v === '1' || v === 'dark'
    // 如果 localStorage 为空，默认使用深色模式，不检查系统偏好
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


