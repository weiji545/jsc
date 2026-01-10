/**
 * 模拟 API 调用
 * @param {any} data
 * @param {number} timeout
 * @returns {Promise}
 */
const mockApi = (data, timeout = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: data,
        message: 'success',
      })
    }, timeout)
  })
}

/**
 * 获取世界地图流向数据
 */
export const getWorldMapFlowData = () => {
  const data = [
    {
      center: '中国',
      flows: [
        // [{ name: "尼日利亚", value: 9100 }, { name: "济南" }],
        // [{ name: "美国洛杉矶", value: 2370 }, { name: "济南" }],
        // [{ name: "香港邦泰", value: 3130 }, { name: "济南" }],
        // [{ name: "美国芝加哥", value: 2350 }, { name: "济南" }],
        // [{ name: "加纳库马西", value: 5120 }, { name: "济南" }],
        // [{ name: "英国曼彻斯特", value: 3110 }, { name: "济南" }],
        // [{ name: "德国汉堡", value: 6280 }, { name: "济南" }],
        // [{ name: "哈萨克斯坦阿拉木图", value: 7255 }, { name: "济南" }],
        // [{ name: "墨西哥", value: 3590 }, { name: "济南" }],
        // [{ name: "加拿大温哥华", value: 3590 }, { name: "济南" }]
      ],
    },
    {
      center: '俄罗斯',
      flows: [
        // [{ name: "俄罗斯", value: 8000 }, { name: "俄罗斯" }],
        // [{ name: "巴西", value: 5000 }, { name: "俄罗斯" }],
        // [{ name: "埃及", value: 4000 }, { name: "俄罗斯" }]
      ],
    },
    {
      center: '美国',
      flows: [
      ],
    },
    {
      center: '墨西哥',
      flows: [
      ],
    },{
      center: '法国',
      flows: [
      ],
    },{
      center: '哈萨克斯坦',
      flows: [
      ],
    },
  ]
  return mockApi(data)
}

/**
 * 获取世界地图地区账户统计数据
 */
export const getWorldAccountData = () => {
  const accountDataMap = {
    '尼日利亚': { count: 120, balance: 1253000 },
    '美国': { count: 85, balance: 2340000 },
    '法国': { count: 320, balance: 5670000 },
    '美国芝加哥': { count: 64, balance: 1890000 },
    '加纳库马西': { count: 45, balance: 980000 },
    '英国曼彻斯特': { count: 110, balance: 3120000 },
    '德国汉堡': { count: 92, balance: 2750000 },
    '哈萨克斯坦': { count: 38, balance: 1150000 },
    '墨西哥': { count: 156, balance: 4230000 },
    '加拿大温哥华': { count: 78, balance: 2100000 },
    '中国': { count: 500, balance: 12000000 },
    '俄罗斯': { count: 300, balance: 8000000 },
  }
  return mockApi(accountDataMap)
}

/**
 * 获取概览数据
 */
export const getOverviewData = () => {
  const overviewData = {
    // 顶部统计
    accountsSummary: {
      domestic: 1254321,
      overseas: 342198,
    },
    // 下方四个环形指标
    ringMetrics: [
      { label: '指标一指标一指标一指标一', value: 321, percent: 32 },
      { label: '指标二', value: -268, percent: -18 },
      { label: '指标三', value: 452, percent: 15 },
      { label: '指标四', value: -189, percent: -8 },
      { label: '指标五', value: 452, percent: 27 },
      { label: '指标六', value: -189, percent: -8 },
    ],
    // 资金统计示例数据（用于“资金金额统计”面板）
    transactionAmount: {
      domestic: 452340.56,
      overseas: 123456.78,
    },
    // 饼图数据（账户区域统计 / 币种数量）
    regionPie: [
      { name: '华北', value: 335 },
      { name: '华东', value: 310 },
      { name: '华南', value: 274 },
      { name: '西南', value: 235 },
      { name: '东北', value: 180 },
    ],
    // 账户币种统计
    currencyPie: [
      { name: '人民币', value: 240 },
      { name: '美元', value: 190 },
      { name: '欧元', value: 150 },
      { name: '日元', value: 180 },
      { name: '英镑', value: 120 },
      { name: '加元', value: 95 },
      { name: '澳元', value: 85 },
      { name: '港币', value: 110 },
      { name: '新加坡元', value: 75 },
      { name: '瑞士法郎', value: 65 },
      { name: '韩元', value: 55 },
      { name: '泰铢', value: 45 },
    ],
    // 右上折线（4块）
    rightTopLines: [
      { label: '指标A', data: [5, 12, 13, 8, 10, 16], percent: 12 },
      { label: '指标B', data: [14, 12, 8, 11, 7, 5], percent: -6 },
      { label: '指标C', data: [5, 12, 13, 8, 10, 16], percent: 12 },
      { label: '指标D', data: [14, 12, 8, 11, 7, 5], percent: -6 },
      { label: '指标E', data: [5, 12, 13, 8, 10, 16], percent: 12 },
      { label: '指标F', data: [14, 12, 8, 11, 7, 5], percent: -6 },
    ],
    // 右中柱+折线
    rightMiddle: {
      categories: ['一季度数据', '二季度数据', '三季度同期', '四季度计划','五季度计划', '储备期一', '储备期二', '调节期A', '调节期B','调节期C'],
      bar: [520, 680, 740, 810, 450,450,450, 560, 620, 700],
      line: [8, 12, -4, 10, 5,5,5, -2, 7, 9],
    },
    // 右下环形
    balanceRing: [
      { name: '人民币', value: 240 },
      { name: '美元', value: 190 },
      { name: '欧元', value: 150 },
      { name: '日元', value: 180 },
      { name: '英镑', value: 120 },
      { name: '加元', value: 95 },
      { name: '澳元', value: 85 },
      { name: '港币', value: 110 },
      { name: '新加坡元', value: 75 },
      { name: '瑞士法郎', value: 65 },
      { name: '韩元', value: 55 },
      { name: '泰铢', value: 45 },
    ],
    // 地球3D国家数据
    globeCountryData: [
      {
        name: '中国',
        count: 12500,
        balance: 125680.5,
      },
      {
        name: '美国',
        count: 15230,
        balance: 234567.8,
      },
      {
        name: '俄罗斯',
        count: 5670,
        balance: 34567.9,
      },
      {
        name: '加拿大',
        count: 4120,
        balance: 28765.4,
      },
      {
        name: '英国',
        count: 3890,
        balance: 19876.3,
      },
      {
        name: '法国',
        count: 3450,
        balance: 18765.2,
      },
      {
        name: '德国',
        count: 4320,
        balance: 23456.9,
      },
      {
        name: '日本',
        count: 5670,
        balance: 45678.1,
      },
      {
        name: '韩国',
        count: 2890,
        balance: 23456.7,
      },
      {
        name: '印度',
        count: 6780,
        balance: 34567.8,
      },
    ],
  }
  return mockApi(overviewData)
}

/**
 * 获取中国地图数据
 */
export const getChinaMapData = () => {
  const data = [
    { name: '广东省', value: 380000000, count: 520 },
    { name: '北京市', value: 340000000, count: 480 },
    { name: '江苏省', value: 310000000, count: 450 },
    { name: '浙江省', value: 280000000, count: 420 },
    { name: '上海市', value: 250000000, count: 390 },
    { name: '山东省', value: 180000000, count: 320 },
    { name: '四川省', value: 150000000, count: 280 },
    { name: '湖北省', value: 120000000, count: 240 },
    { name: '福建省', value: 90000000, count: 180 },
    { name: '河南省', value: 80000000, count: 160 },
    { name: '河北省', value: 70000000, count: 140 },
    { name: '湖南省', value: 60000000, count: 120 },
    { name: '安徽省', value: 50000000, count: 100 },
    { name: '辽宁省', value: 40000000, count: 80 },
    { name: '陕西省', value: 30000000, count: 60 },
    { name: '江西省', value: 20000000, count: 40 },
  ]
  return mockApi(data)
}

/**
 * 获取基础统计数据
 */
export const getBaseDataList = () => {
  const baseDataList = [
    { label: '账户总数', value: 183220, isAmount: false },
    { label: '账户余额总数', value: 56200, isAmount: true, decimals: 2 },
  ]
  return mockApi(baseDataList)
}

/**
 * 获取地区列表
 * @param {Boolean} orderByAsc 是否按金额升序
 */
export const getRegionList = (orderByAsc = true) => {
  const regionList = [
    { name: '北京', value: 45200, count: 1280 },
    { name: '上海', value: 39800, count: 1120 },
    { name: '广州', value: 28900, count: 980 },
    { name: '深圳', value: 21000, count: 760 },
    { name: '杭州', value: 15400, count: 520 },
    { name: '成都', value: 9800, count: 320 },
    { name: '南京', value: 7200, count: 250 },
    { name: '武汉', value: 4800, count: 180 },
  ]

  // 按金额模拟后端排序
  regionList.sort((a, b) => {
    return orderByAsc ? a.value - b.value : b.value - a.value
  })

  return mockApi(regionList)
}

/**
 * 获取汇率数据
 */
export const getExchangeRates = () => {
  const exchangeRates = [
    { name: 'USD/CNY', value: 7.12 },
    { name: 'EUR/CNY', value: 7.85 },
    { name: 'HKD/CNY', value: 0.91 },
    { name: 'JPY/CNY', value: 0.048 },
    { name: 'GBP/CNY', value: 9.13 },
  ]
  return mockApi(exchangeRates)
}

/**
 * 获取趋势数据
 * @param {Object} params { prop, order }
 */
export const getTrendData = (params = {}) => {
  const trendData = {
    trade: {
      categories: ['一月份', '二月份', '三月份同期', '四月份', '五月份计划', '六月份', '七月份重点', '八月份', '九月份预警', '十月份', '十一月份', '十二月份高峰'],
      bar: [320, 280, 360, 420, 390, 450, 480, 510, 550, 600, 580, 630],
      line: [12, 8, 15, 18, 10, 16, 14, 20, 22, 25, 21, 28],
    },
    large: {
      categories: ['一月份', '二月份', '三月份同期', '四月份', '五月份计划', '六月份', '七月份重点', '八月份', '九月份预警', '十月份', '十一月份', '十二月份高峰'],
      bar: [180, 210, 160, 240, 260, 230, 280, 300, 320, 350, 330, 380],
      line: [5, 9, -3, 12, 8, -5, 10, 14, 16, 18, 15, 20],
      // 增加具体的大额支付列表数据以支持模拟排序
      list: [
        { payer: '账户A', payee: '收款人1', amount: 500.5, date: '2025-12-01' },
        { payer: '账户C', payee: '收款人3', amount: 300.2, date: '2025-12-15' },
        { payer: '账户B', payee: '收款人2', amount: 800.8, date: '2025-12-10' },
        { payer: '账户E', payee: '收款人5', amount: 450.0, date: '2025-12-20' },
        { payer: '账户D', payee: '收款人4', amount: 1200.0, date: '2025-12-05' },
        { payer: '账户G', payee: '收款人7', amount: 670.0, date: '2025-12-22' },
        { payer: '账户F', payee: '收款人6', amount: 920.5, date: '2025-12-18' },
        { payer: '账户H', payee: '收款人8', amount: 150.0, date: '2025-12-24' },
      ],
    },
    cash: {
      categories: ['一月份', '二月份', '三月份同期', '四月份', '五月份计划', '六月份', '七月份重点', '八月份', '九月份预警', '十月份', '十一月份', '十二月份高峰'],
      bar: [260, 240, 300, 280, 320, 350, 330, 360, 380, 410, 390, 430],
      line: [6, 4, 10, -2, 9, 7, 5, 11, 13, 15, 12, 17],
    },
  }

  // 模拟后端排序逻辑
  if (params.prop && params.order) {
    const { prop, order } = params
    trendData.large.list.sort((a, b) => {
      let valA = a[prop]
      let valB = b[prop]

      if (prop === 'date') {
        valA = new Date(valA).getTime()
        valB = new Date(valB).getTime()
      }

      if (order === 'ascending') {
        return valA > valB ? 1 : -1
      } else {
        return valA < valB ? 1 : -1
      }
    })
  }

  return mockApi(trendData)
}
