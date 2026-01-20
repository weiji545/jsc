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
 * @param {Number|String} num - 要格式化的数字
 * @param {Number} decimals - 保留小数位数，默认为2
 * @param {Boolean} split - 是否分开返回（整数和小数+单位）
 * @param {String} unit - 自定义单位（替换默认的'元'）
 * @returns {String|Object} 格式化后的字符串或对象
 */
export function formatLargeNumber(num, decimals = 0, split = false, unit) {
  if (num === null || num === undefined || num === '') {
    return '0'
  }

  const number = typeof num === 'string' ? parseFloat(num) : num

  if (isNaN(number)) {
    return '0'
  }

  let amount = number
  let magnitude = ''

  if (number >= 100000000) {
    amount = number / 100000000
    magnitude = '亿元'
  } else if (number >= 10000) {
    amount = number / 10000
    magnitude = '万元'
  }

  // const unitSuffix = unit !== undefined ? unit : (magnitude ? '元' : '')
  const resultStr = formatNumber(amount, decimals) + magnitude //  + unitSuffix

  if (split) {
    const dotIndex = resultStr.indexOf('.')
    if (dotIndex > -1) {
      return {
        value: resultStr.substring(0, dotIndex),
        suffix: resultStr.substring(dotIndex)
      }
    }
    const match = resultStr.match(/([\d,]+)(.*)/)
    if (match) {
        return {
            value: match[1],
            suffix: match[2]
        }
    }
    return { value: resultStr, suffix: '' }
  }

  return resultStr
}

