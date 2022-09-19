// 接口类型
// 接口类型
export enum RouteLabelMatchType {
  EXACT = 'EXACT',
  REGEX = 'REGEX',
  NOT_EQUALS = 'NOT_EQUALS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}
export const RouteLabelMatchTypeOptions = [
  {
    value: RouteLabelMatchType.EXACT,
    text: '全匹配',
  },
  {
    value: RouteLabelMatchType.REGEX,
    text: '正则表达式',
  },
  {
    value: RouteLabelMatchType.NOT_EQUALS,
    text: '不等于',
  },
  {
    value: RouteLabelMatchType.IN,
    text: '包含',
  },
  {
    value: RouteLabelMatchType.NOT_IN,
    text: '不包含',
  },
]

// 匹配规则类型
export enum RoutingArgumentsType {
  CUSTOM = 'CUSTOM',
  METHOD = 'METHOD',
  HEADER = 'HEADER',
  QUERY = 'QUERY',
  COOKIE = 'COOKIE',
  PATH = 'PATH',
  CALLER_IP = 'CALLER_IP',
}

export const RoutingArgumentsTypeOptions = [
  {
    value: RoutingArgumentsType.CUSTOM,
    text: '自定义',
  },
  {
    value: RoutingArgumentsType.HEADER,
    text: '请求头(HEADER)',
  },
  {
    value: RoutingArgumentsType.COOKIE,
    text: '请求Cookie(COOKIE)',
  },
  {
    value: RoutingArgumentsType.QUERY,
    text: '请求参数(QUERY)',
  },
  {
    value: RoutingArgumentsType.METHOD,
    text: '方法(METHOD)',
  },
  {
    value: RoutingArgumentsType.CALLER_IP,
    text: '主调IP',
  },
  {
    value: RoutingArgumentsType.PATH,
    text: '路径',
  },
]
