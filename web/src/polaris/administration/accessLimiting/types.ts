import { Values } from './operations/CreateDuck'

export interface Lists {
  namespaceList: []
  serviceList: []
}

// 限流类型，支持LOCAL（单机限流）, GLOBAL（分布式限流）
export enum LimitType {
  GLOBAL = 'GLOBAL',
  LOCAL = 'LOCAL',
}
export const LimitTypeOptions = [
  {
    value: LimitType.LOCAL,
    text: '单机限流',
  },
  {
    value: LimitType.GLOBAL,
    text: '分布式限流',
  },
]

export const LimitTypeMap = LimitTypeOptions.reduce((map, curr) => {
  map[curr.value] = curr.text
  return map
}, {})

// 限流效果，支持REJECT（直接拒绝）,UNIRATE（匀速排队），默认REJECT
export enum LimitAction {
  REJECT = 'REJECT',
  UNIRATE = 'UNIRATE',
}
export const LimitActionOptions = [
  {
    value: LimitAction.REJECT,
    text: '快速失败',
  },
  {
    value: LimitAction.UNIRATE,
    text: '匀速排队',
  },
]

export const LimitActionMap = LimitActionOptions.reduce((map, curr) => {
  map[curr.value] = curr.text
  return map
}, {})

// 规则启用状态
export enum RuleStatus {
  enabled = 'enabled',
  notEnabled = 'notEnabled',
}
// 修改启用状态
export enum SwitchStatusAction {
  disable = 'disable',
  start = 'start',
}
// 启用状态筛选值
export const StatusOptions = [
  {
    value: RuleStatus.enabled,
    text: '已启用',
  },
  {
    value: RuleStatus.notEnabled,
    text: '未启用',
  },
]

// 接口类型
export enum LimitMethodType {
  EXACT = 'EXACT',
  REGEX = 'REGEX',
  NOT_EQUALS = 'NOT_EQUALS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}
export const LimitMethodTypeOptions = [
  {
    value: LimitMethodType.EXACT,
    text: '全匹配',
  },
  {
    value: LimitMethodType.REGEX,
    text: '正则表达式',
  },
  {
    value: LimitMethodType.NOT_EQUALS,
    text: '不等于',
  },
  {
    value: LimitMethodType.IN,
    text: '包含',
  },
  {
    value: LimitMethodType.NOT_IN,
    text: '不包含',
  },
]

export const LimitMethodTypeMap = LimitMethodTypeOptions.reduce((map, curr) => {
  map[curr.value] = curr.text
  return map
}, {})

// 匹配规则类型
export enum LimitArgumentsType {
  CUSTOM = 'CUSTOM',
  METHOD = 'METHOD',
  HEADER = 'HEADER',
  QUERY = 'QUERY',
  CALLER_SERVICE = 'CALLER_SERVICE',
  CALLER_IP = 'CALLER_IP',
}
export const LimitArgumentsTypeOptions = [
  {
    value: LimitArgumentsType.CUSTOM,
    text: '自定义',
  },
  {
    value: LimitArgumentsType.HEADER,
    text: '请求头(HEADER)',
  },
  {
    value: LimitArgumentsType.QUERY,
    text: '请求参数(QUERY)',
  },
  {
    value: LimitArgumentsType.METHOD,
    text: '方法(METHOD)',
  },
  {
    value: LimitArgumentsType.CALLER_SERVICE,
    text: '主调服务',
  },
  {
    value: LimitArgumentsType.CALLER_IP,
    text: '主调IP',
  },
]

export const LimitArgumentsTypeMap = LimitArgumentsTypeOptions.reduce((map, curr) => {
  map[curr.value] = curr.text
  return map
}, {})

// 失败处理策略
export enum LimitFailover {
  FAILOVER_PASS = 'FAILOVER_PASS',
  FAILOVER_LOCAL = 'FAILOVER_LOCAL',
}
export const LimitFailoverOptions = [
  {
    value: LimitFailover.FAILOVER_LOCAL,
    text: '退化至单机限流',
  },
  {
    value: LimitFailover.FAILOVER_PASS,
    text: '直接通过',
  },
]

export const LimitFailoverMap = LimitFailoverOptions.reduce((map, curr) => {
  map[curr.value] = curr.text
  return map
}, {})

// amounts限流阈值，统计窗口时长的单位
export enum LimitAmountsValidationUnit {
  s = 's',
  m = 'm',
  h = 'h',
}

export const LimitAmountsValidationUnitOptions = [
  {
    value: LimitAmountsValidationUnit.s,
    text: '秒',
  },
  {
    value: LimitAmountsValidationUnit.m,
    text: '分钟',
  },
  {
    value: LimitAmountsValidationUnit.h,
    text: '小时',
  },
]

export const generateDefaultValues: Values = {
  name: '',
  type: LimitType.LOCAL,
  namespace: '',
  service: '',
  method: {
    value: '',
    type: LimitMethodType.EXACT,
  },
  arguments: [
    {
      id: `${Math.round(Math.random() * 10000)}`,
      type: LimitArgumentsType.CUSTOM,
      key: '',
      value: '',
      operator: LimitMethodType.EXACT,
    },
  ],
  amounts: [
    {
      id: `${Math.round(Math.random() * 10000)}`,
      validDurationNum: 1,
      validDurationUnit: LimitAmountsValidationUnit.s,
      maxAmount: 1,
    },
  ],
  regex_combine: true,
  action: LimitAction.REJECT,
  max_queue_delay: 1,
  failover: LimitFailover.FAILOVER_LOCAL,
  disable: true,
  resource: 'QPS',
}
