/**
 * 数字格式化工具函数
 */

/**
 * 将数字格式化为千分符格式
 * @param {Number|String} num - 要格式化的数字
 * @param {Number} decimals - 保留小数位数，默认为0
 * @returns {String} 格式化后的字符串
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || num === '') {
    return '0'
  }

  // 转换为数字
  const number = typeof num === 'string' ? parseFloat(num) : num

  // 检查是否为有效数字
  if (isNaN(number)) {
    return '0'
  }

  // 保留小数位
  const fixedNum = decimals > 0 ? number.toFixed(decimals) : Math.floor(number).toString()

  // 分割整数和小数部分
  const parts = fixedNum.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]

  // 添加千分符
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // 如果有小数部分，拼接回去
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger
}

/**
 * 格式化大数字（带单位：万、百万等）
 * @param {Number|String} num - 要格式化的数字
 * @returns {String} 格式化后的字符串
 */
export function formatLargeNumber(num) {
  if (num === null || num === undefined || num === '') {
    return '0'
  }

  const number = typeof num === 'string' ? parseFloat(num) : num

  if (isNaN(number)) {
    return '0'
  }

  if (number >= 1000000) {
    return formatNumber((number / 1000000).toFixed(2)) + 'M'
  } else if (number >= 10000) {
    return formatNumber((number / 10000).toFixed(2)) + '万'
  } else {
    return formatNumber(number)
  }
}

