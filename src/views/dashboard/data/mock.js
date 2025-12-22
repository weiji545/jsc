// 本地假数据

export const overviewData = {
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
    overseas: 123456.78
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
    { name: '欧元', value: 190 },
    { name: '美元', value: 150 },
    { name: '日元', value: 180 },
    { name: '加元', value: 190 },
    { name: '澳元', value: 50 }
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
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    bar: [520, 680, 740, 810],
    line: [8, 12, -4, 10],
  },
  // 右下环形
  balanceRing: {
    global: [
      { name: '活期', value: 420 },
      { name: '定期', value: 360 },
      { name: '理财', value: 280 },
    ],
    domestic: [
      { name: '活期', value: 220 },
      { name: '定期', value: 260 },
      { name: '理财', value: 200 },
    ],
    overseas: [
      { name: '活期', value: 200 },
      { name: '定期', value: 100 },
      { name: '理财', value: 80 },
    ],
  },
  // 地球3D国家数据（key 为英文名，对应 world.json 的 properties.name）
  globeCountryData: {
    China: { name: 'China', chineseName: '中国', accounts: 12500, balance: 125680.5 },
    'United States of America': { name: 'United States of America', chineseName: '美国', accounts: 15230, balance: 234567.8 },
    Russia: { name: 'Russia', chineseName: '俄罗斯', accounts: 5670, balance: 34567.9 },
    Canada: { name: 'Canada', chineseName: '加拿大', accounts: 4120, balance: 28765.4 },
    'United Kingdom': { name: 'United Kingdom', chineseName: '英国', accounts: 3890, balance: 19876.3 },
    France: { name: 'France', chineseName: '法国', accounts: 3450, balance: 18765.2 },
    Germany: { name: 'Germany', chineseName: '德国', accounts: 4320, balance: 23456.9 },
    Japan: { name: 'Japan', chineseName: '日本', accounts: 5670, balance: 45678.1 },
    'South Korea': { name: 'South Korea', chineseName: '韩国', accounts: 2890, balance: 23456.7 },
    India: { name: 'India', chineseName: '印度', accounts: 6780, balance: 34567.8 },
    Australia: { name: 'Australia', chineseName: '澳大利亚', accounts: null, balance: null },
    Brazil: { name: 'Brazil', chineseName: '巴西', accounts: null, balance: null },
    'South Africa': { name: 'South Africa', chineseName: '南非', accounts: null, balance: null },
    'Saudi Arabia': { name: 'Saudi Arabia', chineseName: '沙特阿拉伯', accounts: null, balance: null },
    'United Arab Emirates': { name: 'United Arab Emirates', chineseName: '阿联酋', accounts: null, balance: null },
    Qatar: { name: 'Qatar', chineseName: '卡塔尔', accounts: null, balance: null },
    Italy: { name: 'Italy', chineseName: '意大利', accounts: null, balance: null },
    Spain: { name: 'Spain', chineseName: '西班牙', accounts: null, balance: null },
    Mexico: { name: 'Mexico', chineseName: '墨西哥', accounts: null, balance: null },
    Argentina: { name: 'Argentina', chineseName: '阿根廷', accounts: null, balance: null },
    Indonesia: { name: 'Indonesia', chineseName: '印度尼西亚', accounts: null, balance: null },
    Thailand: { name: 'Thailand', chineseName: '泰国', accounts: null, balance: null },
    Singapore: { name: 'Singapore', chineseName: '新加坡', accounts: null, balance: null },
    Malaysia: { name: 'Malaysia', chineseName: '马来西亚', accounts: null, balance: null },
    Philippines: { name: 'Philippines', chineseName: '菲律宾', accounts: null, balance: null },
    Vietnam: { name: 'Vietnam', chineseName: '越南', accounts: null, balance: null },
    Turkey: { name: 'Turkey', chineseName: '土耳其', accounts: null, balance: null },
    Egypt: { name: 'Egypt', chineseName: '埃及', accounts: null, balance: null }
  }
}

