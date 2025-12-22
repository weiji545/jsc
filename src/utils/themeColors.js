// 主题颜色常量
export const THEME_COLORS = {
  // 标题和数字颜色
  titleDark: '#FFFFFF',
  titleLight: '#181818',

  // 文字提示颜色
  labelDark: '#9EC7F0',
  labelLight: '#666666',

  // 文字2提示颜色
  label2Dark: '#C3E2FF',
  label2Light: '#666666',
}

// 获取当前模式下的颜色
export function getThemeColor(isDarkMode, type = 'title') {
  if (type === 'title') {
    return isDarkMode ? THEME_COLORS.titleDark : THEME_COLORS.titleLight
  } else if (type === 'label') {
    return isDarkMode ? THEME_COLORS.labelDark : THEME_COLORS.labelLight
  }
  return THEME_COLORS.titleDark
}

