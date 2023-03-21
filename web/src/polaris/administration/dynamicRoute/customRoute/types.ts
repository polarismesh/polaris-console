import i18n from '@src/polaris/common/util/i18n'

// 接口类型
// 接口类型
export enum RouteLabelMatchType {
  EXACT = 'EXACT',
  REGEX = 'REGEX',
  NOT_EQUALS = 'NOT_EQUALS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  RANGE = 'RANGE',
}
export const RouteLabelMatchTypeOptions = [
  {
    value: RouteLabelMatchType.EXACT,
    text: i18n.t('等于'),
  },
  {
    value: RouteLabelMatchType.REGEX,
    text: i18n.t('正则表达式匹配'),
  },
  {
    value: RouteLabelMatchType.NOT_EQUALS,
    text: i18n.t('不等于'),
  },
  {
    value: RouteLabelMatchType.IN,
    text: i18n.t('包含'),
  },
  {
    value: RouteLabelMatchType.NOT_IN,
    text: i18n.t('不包含'),
  },
  {
    value: RouteLabelMatchType.RANGE,
    text: i18n.t('范围表达式'),
  },
]
export const RouteLabelTextMap = RouteLabelMatchTypeOptions.reduce((map, curr) => {
  map[curr.value] = curr.text
  return map
}, {})

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

export enum RoutingValueType {
  TEXT = 'TEXT',
  PARAMETER = 'PARAMETER',
}
export const RoutingValueTextMap = {
  [RoutingValueType.TEXT]: i18n.t('值'),
  [RoutingValueType.PARAMETER]: i18n.t('变量'),
}
export const RoutingValueTypeOptions = [
  {
    text: i18n.t('值'),
    value: RoutingValueType.TEXT,
  },
  // {
  //   text: '变量',
  //   value: RoutingValueType.PARAMETER,
  // },
]
export const RoutingArgumentsTypeOptions = [
  {
    value: RoutingArgumentsType.CUSTOM,
    text: i18n.t('自定义'),
  },
  {
    value: RoutingArgumentsType.HEADER,
    text: i18n.t('请求头(HEADER)'),
  },
  {
    value: RoutingArgumentsType.COOKIE,
    text: i18n.t('请求Cookie(COOKIE)'),
  },
  {
    value: RoutingArgumentsType.QUERY,
    text: i18n.t('请求参数(QUERY)'),
  },
  {
    value: RoutingArgumentsType.METHOD,
    text: i18n.t('方法(METHOD)'),
  },
  {
    value: RoutingArgumentsType.CALLER_IP,
    text: i18n.t('主调IP'),
  },
  {
    value: RoutingArgumentsType.PATH,
    text: i18n.t('路径'),
  },
]
export const RouteArgumentTextMap = RoutingArgumentsTypeOptions.reduce((map, curr) => {
  map[curr.value] = curr.text
  return map
}, {})
